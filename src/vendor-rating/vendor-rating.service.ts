import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { RateVendorDto } from './dto/rate-vendor.dto';
import { GetUnifiedVendorRatingQueryDto } from './dto/get-unified-vendor-rating.dto';
import { VendorCategoryType } from '@prisma/client';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import {
  verifyTargetAndExtractVendor,
  extractRatingsAndCalculateOverall,
  buildVendorRatingUpsertArgs,
  ExistingVendorRating,
} from './utils/create-vendor-rating.utils';
import {
  VendorRatingSummary,
  fetchVendorRatingSummary,
  fetchMyRatingAndReview,
  fetchPaginatedVendorReviews,
} from './utils/get-common-vendor-rating.utils';
import { fetchMyLastDeliveredOrder } from './utils/get-order-vendor-rating.utils';
import { fetchMyLastCompletedBooking } from './utils/get-booking-vendor-rating.utils';

export { VendorRatingSummary };

@Injectable()
export class VendorRatingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly responseService: ResponseService,
    private readonly metadataService: MetadataService,
  ) {}

  /**
   * Unified Get Vendor Ratings & Reviews (PRODUCT, SERVICE & BANNER)
   * Returns:
   * - overallSummary: overallRating, totalRatings, parameterAverages
   * - myRating, myReview, myLastTransaction (Order or Booking)
   * - reviews: paginated review list sorted by createdAt: desc with each customer ratings breakdown
   */
  async getVendorRatings({
    vendorId,
    query,
    userId,
    res,
  }: {
    vendorId: string;
    query: GetUnifiedVendorRatingQueryDto;
    userId?: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const offset = Number(query.offset ?? 0);
    const limit = Number(query.limit ?? 10);
    const isOverallSummaryNeeded = query.isOverallSummaryNeeded ?? true;
    const isMyRatingNeeded = query.isMyRatingNeeded ?? true;
    const isMyReviewNeeded = query.isMyReviewNeeded ?? true;
    const isMyLastTransactionNeeded =
      query.isMyLastTransactionNeeded ??
      query.isMyLastOrderNeeded ??
      query.isMyLastBookingNeeded ??
      true;

    /*----- DB calling: verify vendor existence & category type -----*/
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        vendorType: {
          select: { type: true, name: true },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const categoryType = vendor.vendorType.type;

    /*----- Parallel execution using modular utils -----*/
    const [summaryResult, reviewsResult, myRatingAndReview, lastTransaction] =
      await Promise.all([
        // 1. Overall Summary (if requested) - includes overallRating, totalRatings, parameterAverages
        isOverallSummaryNeeded
          ? fetchVendorRatingSummary({
              vendorId,
              categoryType,
              prisma: this.prisma,
              redis: this.redisService,
            })
          : Promise.resolve(null),

        // 2. Paginated Reviews & Total Count (sorted by createdAt: desc, with full ratings breakdown)
        fetchPaginatedVendorReviews({
          vendorId,
          offset,
          limit,
          prisma: this.prisma,
        }),

        // 3. User's previous rating & review (if authenticated)
        userId && (isMyRatingNeeded || isMyReviewNeeded)
          ? fetchMyRatingAndReview({
              vendorId,
              userId,
              prisma: this.prisma,
              isMyRatingNeeded,
              isMyReviewNeeded,
            })
          : Promise.resolve({ myRating: null, myReview: null }),

        // 4. User's last eligible transaction (Order for PRODUCT, Booking for SERVICE/BANNER)
        userId && isMyLastTransactionNeeded
          ? categoryType === VendorCategoryType.PRODUCT
            ? fetchMyLastDeliveredOrder({
                prisma: this.prisma,
                userId,
                vendorId,
              })
            : fetchMyLastCompletedBooking({
                prisma: this.prisma,
                userId,
                vendorId,
              })
          : Promise.resolve(null),
      ]);

    const { reviews, totalCount } = reviewsResult;
    const { myRating, myReview } = myRatingAndReview;

    /*----- Clean up cached diagnostic flag and starCounts from overallSummary if present -----*/
    let cleanSummary = summaryResult;
    if (cleanSummary) {
      const { cached, starCounts, ...rest } = cleanSummary as any;
      cleanSummary = rest as any;
    }

    /*----- Pagination metadata using MetadataService -----*/
    const queries = buildQueryParams({
      offset: offset.toString(),
      limit: limit.toString(),
      isOverallSummaryNeeded: isOverallSummaryNeeded.toString(),
      isMyRatingNeeded: isMyRatingNeeded.toString(),
      isMyReviewNeeded: isMyReviewNeeded.toString(),
      isMyLastTransactionNeeded: isMyLastTransactionNeeded.toString(),
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `vendor-rating/vendor/${vendorId}`,
      queries,
    });

    const isProduct = categoryType === VendorCategoryType.PRODUCT;

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'Vendor ratings and reviews retrieved successfully',
      data: {
        categoryType,
        overallSummary: cleanSummary,
        myRating,
        myReview,
        myLastTransaction: lastTransaction,
        ...(isProduct
          ? { myLastOrder: lastTransaction }
          : { myLastBooking: lastTransaction }),
        reviews,
      },
      meta,
      statusCode: 200,
    });
  }

  /**
   * Submit or update a 5-parameter rating or review for a vendor.
   * Target is determined via orderId or bookingId (author ownership verified).
   * Supports rating breakdown, review text, or combining both.
   * Strictly 1 rating per customer per vendor (idempotent upsert).
   * Invalidates Redis cache on update.
   */
  async upsertRating({
    userId,
    body,
    res,
  }: {
    userId: string;
    body: RateVendorDto;
    res: Response;
  }) {
    const initialDate = new Date();

    // utils: verify target (order or booking) and extract vendorId & categoryType
    const { vendorId, categoryType } = await verifyTargetAndExtractVendor({
      body,
      userId,
      getOrderByOrderId: (id) => this.getOrderByOrderId(id),
      getBookingById: (id) => this.getBookingById(id),
    });

    const { selectedRatings, calculatedOverallRating } =
      extractRatingsAndCalculateOverall({
        body,
        categoryType,
      });

    const existingRating: ExistingVendorRating | null =
      await this.prisma.vendorRating.findUnique({
        where: {
          userId_vendorId: {
            userId,
            vendorId,
          },
        },
      });

    // utils: build upsert query arguments
    const upsertArgs = buildVendorRatingUpsertArgs({
      userId,
      vendorId,
      body,
      existingRating,
      selectedRatings,
      calculatedOverallRating,
    });

    /*----- DB calling: upsert vendor rating -----*/
    const savedRating = await this.prisma.vendorRating.upsert(upsertArgs);

    // Invalidate cached rating summary in Redis
    try {
      await this.redisService.rem(`vendor:rating:summary:${vendorId}`);
    } catch {
      // Redis fail-safe
    }

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'Vendor rating submitted successfully',
      data: savedRating,
      statusCode: 200,
    });
  }

  /**
   * Helper for internal/cross-module rating summary lookup (e.g. UnifiedService).
   */
  async getVendorRatingSummary(
    vendorId: string,
    categoryType: VendorCategoryType,
  ): Promise<VendorRatingSummary> {
    return await fetchVendorRatingSummary({
      vendorId,
      categoryType,
      prisma: this.prisma,
      redis: this.redisService,
    });
  }

  /*----- utils -----*/

  async getOrderByOrderId(orderId: string) {
    return await this.prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderId: orderId }],
      },
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                vendor: {
                  include: {
                    vendorType: true,
                  },
                },
              },
            },
            orderItemVendorServiceOption: {
              include: {
                vendorServiceOption: {
                  include: {
                    vendor: {
                      include: {
                        vendorType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getBookingById(bookingId: string) {
    return await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookedId: bookingId }],
      },
      include: {
        bannerBooking: {
          include: {
            vendor: {
              include: {
                vendorType: true,
              },
            },
          },
        },
        serviceBooking: {
          include: {
            vendorSubService: {
              include: {
                service: {
                  include: {
                    vendor: {
                      include: {
                        vendorType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
