import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from '../metadata/metadata.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseService } from '../response/response.service';
import { RedisService } from '../redis/redis.service';
import { HomeApiDto } from './dto/home-api.dto';
import { GetVendorDashboardQueryDto } from './dto/get-vendor-dashboard-query.dto';
import { OrderPaymentType, VendorCategoryType } from '@prisma/client';
import { getUtcTimeRangeForIstRange } from '../coins-settlement/utils/get-coins-settlement.utils';
import { fetchVendorRatingSummary } from '../vendor-rating/utils/get-common-vendor-rating.utils';

@Injectable()
export class HomeApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly redisService: RedisService,
  ) {}

  // =========================================================================
  // Core Calculation: Bar Chart Metrics (Reused by legacy & unified endpoints)
  // =========================================================================
  async computeBarChartMetrics({
    vendorId,
    start,
    end,
  }: {
    vendorId: string;
    start: Date;
    end: Date;
  }) {
    // 1. Total orders count
    const totalOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        orderItems: {
          some: {
            item: {
              vendorId: vendorId,
            },
          },
        },
        orderPayment: {
          isNot: null,
        },
      },
    });

    // 2. Service options breakdown
    const serviceOptionCounts =
      await this.prisma.orderItemVendorServiceOption.groupBy({
        by: ['vendorServiceOptionId'],
        _count: {
          vendorServiceOptionId: true,
        },
        where: {
          orderItem: {
            order: {
              createdAt: {
                gte: start,
                lte: end,
              },
              orderPayment: {
                isNot: null,
              },
            },
          },
          vendorServiceOption: {
            vendorId: vendorId,
          },
        },
      });

    const serviceOptionNames = await this.prisma.vendorServiceOption.findMany({
      select: {
        id: true,
        serviceOption: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        vendorId: vendorId,
        id: {
          in: serviceOptionCounts.map((item) => item.vendorServiceOptionId),
        },
      },
    });

    // 3. Payment methods breakdown
    const [totalOrdersByCash, totalOrdersByJuspay, totalOrdersByCoins] =
      await Promise.all([
        this.prisma.order.count({
          where: {
            orderPayment: {
              type: OrderPaymentType.CASH,
            },
            orderItems: {
              some: {
                item: {
                  vendorId: vendorId,
                },
              },
            },
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),
        this.prisma.order.count({
          where: {
            orderPayment: {
              type: OrderPaymentType.JUSPAY,
            },
            orderItems: {
              some: {
                item: {
                  vendorId: vendorId,
                },
              },
            },
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),
        this.prisma.order.count({
          where: {
            orderPayment: {
              type: OrderPaymentType.COINS,
            },
            orderItems: {
              some: {
                item: {
                  vendorId: vendorId,
                },
              },
            },
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),
      ]);

    return {
      dateRange: {
        start,
        end,
      },
      totalOrders: totalOrdersCount,
      ordersByServiceOption: serviceOptionCounts.map((item) => {
        const matchedOption = serviceOptionNames.find(
          (option) => option.id === item.vendorServiceOptionId,
        );

        const serviceOptionId = matchedOption?.serviceOption.id ?? '';
        const serviceOptionName =
          matchedOption?.serviceOption.name ?? 'Unknown';

        return {
          serviceOptionId,
          serviceOptionName,
          orderCount: item._count.vendorServiceOptionId,
        };
      }),
      ordersByPaymentMethod: {
        CASH: totalOrdersByCash,
        JUSPAY: totalOrdersByJuspay,
        COINS: totalOrdersByCoins,
      },
    };
  }

  // =========================================================================
  // Legacy Endpoint Handler: GET /home-api/bar-chart/:vendorId
  // NOTE: Leave aside without altering response structure
  // =========================================================================
  async getBarChartData({
    vendorId,
    res,
    body,
  }: {
    vendorId: string;
    res: Response;
    body: HomeApiDto;
  }) {
    const initialDate = new Date();

    const { startDateTime, endDateTime } = body;

    const start = getUtcTimeRangeForIstRange(new Date(startDateTime)).startIst;
    const end = getUtcTimeRangeForIstRange(new Date(endDateTime)).endIst;

    const result = await this.computeBarChartMetrics({
      vendorId,
      start,
      end,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'BarChart fetched Successfully',
      data: {
        totalOrders: result.totalOrders,
        ordersByServiceOption: result.ordersByServiceOption,
        ordersByPaymentMethod: result.ordersByPaymentMethod,
      },
      statusCode: 201,
    });
  }

  // =========================================================================
  // Helper: Fetch Vendor Wallet and Credit
  // =========================================================================
  async fetchVendorWallet(walletOwnerUserId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId: walletOwnerUserId,
      },
      include: {
        user: {
          select: {
            name: true,
            vendor: {
              select: {
                adminVendorCredit: true,
              },
            },
          },
        },
      },
    });

    if (!wallet) {
      return null;
    }

    const credit = wallet.user?.vendor?.adminVendorCredit;

    return {
      id: wallet.id,
      balance: wallet.balance,
      lockedBalance: wallet.lockedBalance,
      isLocked: wallet.locked,
      adminVendorCredit: credit
        ? {
            id: credit.id,
            totalGiven: credit.totalGiven,
            totalRefunded: credit.totalRefunded,
            availableCredit: Math.max(
              0,
              credit.totalGiven - credit.totalRefunded,
            ),
          }
        : null,
    };
  }

  // =========================================================================
  // Helper: Fetch Active Vendor Subscription
  // =========================================================================
  async fetchVendorActiveSubscription(vendorId: string) {
    const currentDate = new Date();

    const subscription = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId,
        isActive: true,
        startDate: { lte: currentDate },
        endDate: { gt: currentDate },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      planId: subscription.planId,
      planName: subscription.planName,
      planBillingPeriod: subscription.planBillingPeriod,
      planPrice: subscription.planPrice,
      planDiscountPrice: subscription.planDiscountPrice,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isActive: subscription.isActive,
      planFeatures: subscription.planFeatures,
    };
  }

  // =========================================================================
  // Helper: Fetch Vendor Ratings Summary (with Redis Cache fallback)
  // =========================================================================
  async fetchVendorRatingSummarySafe(
    vendorId: string,
    categoryType: VendorCategoryType,
  ) {
    try {
      const summary = await fetchVendorRatingSummary({
        vendorId,
        categoryType,
        prisma: this.prisma,
        redis: this.redisService,
      });

      // starCounts and cached flag are excluded from the vendor dashboard
      const { starCounts, cached, ...rest } = summary;
      return rest;
    } catch {
      return {
        overallRating: 0,
        totalRatings: 0,
        categoryType,
        parameterAverages: {},
      };
    }
  }

  // =========================================================================
  // New Unified Endpoint Handler: GET /home-api/vendor/dashboard
  // Aggregates: Wallet, BarChart, Rating Summary, and Subscription in parallel.
  // =========================================================================
  async getVendorDashboard({
    vendorId,
    walletOwnerUserId,
    isStaff,
    query,
    res,
  }: {
    vendorId: string;
    walletOwnerUserId: string;
    isStaff: boolean;
    query?: GetVendorDashboardQueryDto;
    res: Response;
  }) {
    const initialDate = new Date();

    // 1. Validate vendor exists and load comprehensive profile
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        vendorType: true,
        serviceVendorKeyword: {
          include: {
            keyword: true,
          },
        },
        vendorServiceOption: {
          include: { serviceOption: true },
        },
        User: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            imageRef: true,
            status: true,
            countryCode: true,
            mobile: true,
            email: true,
            referralCode: true,
            referees: true,
            referrer: true,
          },
        },
        shopInfo: {
          include: {
            license: {
              include: {
                licenseCategory: true,
              },
            },
            shopCategory: true,
            shopCity: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const categoryType = vendor.vendorType?.type ?? VendorCategoryType.PRODUCT;

    // 2. Resolve date range (defaulting to last 7 days)
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const start = query?.startDateTime
      ? getUtcTimeRangeForIstRange(new Date(query.startDateTime)).startIst
      : defaultStart;

    const end = query?.endDateTime
      ? getUtcTimeRangeForIstRange(new Date(query.endDateTime)).endIst
      : now;

    // 3. Parallel execution of the 4 sections
    const [wallet, barChart, ratingSummary, currentSubscription] =
      await Promise.all([
        this.fetchVendorWallet(walletOwnerUserId),
        this.computeBarChartMetrics({ vendorId, start, end }),
        this.fetchVendorRatingSummarySafe(vendorId, categoryType),
        this.fetchVendorActiveSubscription(vendorId),
      ]);

    const dashboardData = {
      vendor: {
        ...vendor,
        vendorId: vendor.id,
        ownerUserId: vendor.userId,
        ownerName: vendor.User?.name ?? null,
        shopName: vendor.shopInfo?.name ?? null,
        isShopOpen: vendor.shopInfo?.isShopOpen ?? false,
        categoryType,
        isStaff,
      },
      wallet,
      barChart,
      ratingSummary,
      currentSubscription,
    };

    return this.responseService.successResponse({
      initialDate,
      res,
      data: dashboardData,
      message: 'Vendor dashboard retrieved successfully',
      statusCode: 200,
    });
  }
}
