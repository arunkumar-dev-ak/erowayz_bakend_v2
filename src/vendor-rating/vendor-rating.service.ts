import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { RateVendorDto } from './dto/rate-vendor.dto';
import { GetVendorRatingQueryDto } from './dto/get-vendor-rating.dto';
import { GetBookingVendorRatingQueryDto } from './dto/get-booking-vendor-rating.dto';
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
   * 1. Get Vendor Ratings & Reviews for Orders (Product Vendors)
   */
  async getOrderVendorRatings({
    vendorId,
    query,
    userId,
    res,
  }: {
    vendorId: string;
    query: GetVendorRatingQueryDto;
    userId?: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const offset = Number(query.offset ?? 0);
    const limit = Number(query.limit ?? 10);
    const isOverallSummaryNeeded = query.isOverallSummaryNeeded ?? true;
    const isMyRatingNeeded = query.isMyRatingNeeded ?? true;
    const isMyReviewNeeded = query.isMyReviewNeeded ?? true;
    const isMyLastOrderNeeded = query.isMyLastOrderNeeded ?? true;

    /*----- DB calling: verify vendor existence & category type (only if summary needed) -----*/
    let categoryType: VendorCategoryType = VendorCategoryType.PRODUCT;
    if (isOverallSummaryNeeded) {
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

      categoryType = vendor.vendorType.type;
    }

    /*----- Parallel execution using modular utils -----*/
    const [summaryResult, reviewsResult, myRatingAndReview, myLastOrder] =
      await Promise.all([
        // 1. Overall Summary (if requested)
        isOverallSummaryNeeded
          ? fetchVendorRatingSummary({
              vendorId,
              categoryType,
              prisma: this.prisma,
              redis: this.redisService,
            })
          : Promise.resolve(null),

        // 2. Paginated Reviews & Total Count
        fetchPaginatedVendorReviews({
          vendorId,
          offset,
          limit,
          prisma: this.prisma,
        }),

        // 3. User's previous rating & review (if authenticated)
        userId
          ? fetchMyRatingAndReview({
              vendorId,
              userId,
              prisma: this.prisma,
              isMyRatingNeeded,
              isMyReviewNeeded,
            })
          : Promise.resolve({ myRating: null, myReview: null }),

        // 4. User's last completed/delivered product order (if authenticated)
        userId && isMyLastOrderNeeded
          ? fetchMyLastDeliveredOrder({
              prisma: this.prisma,
              userId,
              vendorId,
            })
          : Promise.resolve(null),
      ]);

    const { reviews, totalCount } = reviewsResult;
    const { myRating, myReview } = myRatingAndReview;

    /*----- Pagination metadata using MetadataService (matching banner-booking) -----*/
    const queries = buildQueryParams({
      offset: offset.toString(),
      limit: limit.toString(),
      isOverallSummaryNeeded: isOverallSummaryNeeded.toString(),
      isMyRatingNeeded: isMyRatingNeeded.toString(),
      isMyReviewNeeded: isMyReviewNeeded.toString(),
      isMyLastOrderNeeded: isMyLastOrderNeeded.toString(),
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `vendor-rating/order/vendor/${vendorId}`,
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'Vendor ratings and reviews retrieved successfully',
      data: {
        overallSummary: summaryResult,
        myRating,
        myReview,
        myLastOrder,
        reviews,
      },
      meta,
      statusCode: 200,
    });
  }

  /**
   * Alias for backward compatibility
   */
  async getVendorRatings(args: {
    vendorId: string;
    query: GetVendorRatingQueryDto;
    userId?: string;
    res: Response;
  }) {
    return this.getOrderVendorRatings(args);
  }

  /**
   * 2. Get Vendor Ratings & Reviews for Bookings (Service & Banner Vendors)
   */
  async getBookingVendorRatings({
    vendorId,
    query,
    userId,
    res,
  }: {
    vendorId: string;
    query: GetBookingVendorRatingQueryDto;
    userId?: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const offset = Number(query.offset ?? 0);
    const limit = Number(query.limit ?? 10);
    const isOverallSummaryNeeded = query.isOverallSummaryNeeded ?? true;
    const isMyRatingNeeded = query.isMyRatingNeeded ?? true;
    const isMyReviewNeeded = query.isMyReviewNeeded ?? true;
    const isMyLastBookingNeeded = query.isMyLastBookingNeeded ?? true;

    /*----- DB calling: verify vendor existence & category type (only if summary needed) -----*/
    let categoryType: VendorCategoryType = VendorCategoryType.SERVICE;
    if (isOverallSummaryNeeded) {
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

      categoryType = vendor.vendorType.type;
    }

    /*----- Parallel execution using modular booking utils -----*/
    const [summaryResult, reviewsResult, myRatingAndReview, myLastBooking] =
      await Promise.all([
        // 1. Overall Summary (if requested)
        isOverallSummaryNeeded
          ? fetchVendorRatingSummary({
              vendorId,
              categoryType,
              prisma: this.prisma,
              redis: this.redisService,
            })
          : Promise.resolve(null),

        // 2. Paginated Reviews & Total Count
        fetchPaginatedVendorReviews({
          vendorId,
          offset,
          limit,
          prisma: this.prisma,
        }),

        // 3. User's previous rating & review (if authenticated)
        userId
          ? fetchMyRatingAndReview({
              vendorId,
              userId,
              prisma: this.prisma,
              isMyRatingNeeded,
              isMyReviewNeeded,
            })
          : Promise.resolve({ myRating: null, myReview: null }),

        // 4. User's last completed booking (Service or Banner, if authenticated)
        userId && isMyLastBookingNeeded
          ? fetchMyLastCompletedBooking({
              prisma: this.prisma,
              userId,
              vendorId,
            })
          : Promise.resolve(null),
      ]);

    const { reviews, totalCount } = reviewsResult;
    const { myRating, myReview } = myRatingAndReview;

    /*----- Pagination metadata using MetadataService (matching banner-booking) -----*/
    const queries = buildQueryParams({
      offset: offset.toString(),
      limit: limit.toString(),
      isOverallSummaryNeeded: isOverallSummaryNeeded.toString(),
      isMyRatingNeeded: isMyRatingNeeded.toString(),
      isMyReviewNeeded: isMyReviewNeeded.toString(),
      isMyLastBookingNeeded: isMyLastBookingNeeded.toString(),
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `vendor-rating/booking/vendor/${vendorId}`,
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'Vendor booking ratings and reviews retrieved successfully',
      data: {
        overallSummary: summaryResult,
        myRating,
        myReview,
        myLastBooking,
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
