import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { VendorRatingService } from 'src/vendor-rating/vendor-rating.service';
import { VendorCategoryType } from '@prisma/client';
import { GetUnifiedStorefrontQueryDto } from './dto/get-unified-storefront-query.dto';
import {
  fetchCustomerExistingRating,
  fetchShopTimings,
  fetchUnifiedVendorProfile,
  formatUnifiedVendorProfile,
} from './utils/unified-common.utils';
import {
  fetchActiveVendorCategories,
  fetchLastDeliveredOrder,
  fetchPaginatedStoreItems,
  fetchStoreItemsCount,
} from './utils/unified-product.utils';
import {
  fetchActiveVendorServiceOptions,
  fetchLastCompletedBooking,
  fetchPaginatedStoreServices,
  fetchStoreServicesCount,
} from './utils/unified-service.utils';
import {
  fetchPaginatedStoreBanners,
  fetchStoreBannersCount,
} from './utils/unified-banner.utils';

@Injectable()
export class UnifiedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vendorRatingService: VendorRatingService,
    private readonly responseService: ResponseService,
    private readonly metadataService: MetadataService,
  ) {}

  /**
   * Dynamic Unified Vendor Storefront (PRODUCT, SERVICE & BANNER)
   * Resolves categoryType from vendorType and dynamically executes
   * parallel queries tailored for the specific business model.
   */
  async getStorefront({
    vendorId,
    query,
    userId,
    res,
  }: {
    vendorId: string;
    query: GetUnifiedStorefrontQueryDto;
    userId?: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const offset = Number(query.offset ?? 0);
    const limit = Number(query.limit ?? 10);
    const filterId = query.filterId;

    /*----- DB calling via utils: verify vendor existence & profile -----*/
    const vendor = await fetchUnifiedVendorProfile({
      vendorId,
      userId,
      prisma: this.prisma,
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const categoryType = vendor.vendorType.type;

    /*----- Common section promises across all categories -----*/
    const shopTimingPromise = fetchShopTimings({
      vendorId,
      prisma: this.prisma,
    });
    const ratingSummaryPromise =
      this.vendorRatingService.getVendorRatingSummary(vendorId, categoryType);
    const userRatingPromise = userId
      ? fetchCustomerExistingRating({
          prisma: this.prisma,
          userId,
          vendorId,
        })
      : Promise.resolve(null);

    let totalCount = 0;
    let dataPayload: Record<string, any> = {};

    /*----- Dynamic dispatch based on VendorCategoryType -----*/
    switch (categoryType) {
      case VendorCategoryType.SERVICE: {
        const [
          shopTiming,
          ratingSummary,
          userRating,
          serviceOptions,
          services,
          count,
          lastCompletedBooking,
        ] = await Promise.all([
          shopTimingPromise,
          ratingSummaryPromise,
          userRatingPromise,
          fetchActiveVendorServiceOptions({ vendorId, prisma: this.prisma }),
          fetchPaginatedStoreServices({
            vendorId,
            offset,
            limit,
            serviceOptionId: filterId,
            prisma: this.prisma,
          }),
          fetchStoreServicesCount({
            vendorId,
            serviceOptionId: filterId,
            prisma: this.prisma,
          }),
          userId
            ? fetchLastCompletedBooking({
                vendorId,
                userId,
                prisma: this.prisma,
              })
            : Promise.resolve(null),
        ]);

        totalCount = count;
        const formattedVendor = formatUnifiedVendorProfile({
          vendor,
          ratingSummary,
          shopTiming,
          userId,
        });

        dataPayload = {
          categoryType,
          vendor: formattedVendor,
          serviceOptions,
          services,
          lastCompletedBooking,
          userRating,
        };
        break;
      }

      case VendorCategoryType.BANNER: {
        const [
          shopTiming,
          ratingSummary,
          userRating,
          banners,
          count,
          lastCompletedBooking,
        ] = await Promise.all([
          shopTimingPromise,
          ratingSummaryPromise,
          userRatingPromise,
          fetchPaginatedStoreBanners({
            vendorId,
            offset,
            limit,
            prisma: this.prisma,
          }),
          fetchStoreBannersCount({ vendorId, prisma: this.prisma }),
          userId
            ? fetchLastCompletedBooking({
                vendorId,
                userId,
                prisma: this.prisma,
              })
            : Promise.resolve(null),
        ]);

        totalCount = count;
        const formattedVendor = formatUnifiedVendorProfile({
          vendor,
          ratingSummary,
          shopTiming,
          userId,
        });

        dataPayload = {
          categoryType,
          vendor: formattedVendor,
          banners,
          lastCompletedBooking,
          userRating,
        };
        break;
      }

      case VendorCategoryType.PRODUCT:
      default: {
        const [
          shopTiming,
          ratingSummary,
          userRating,
          categories,
          items,
          count,
          lastDeliveredOrder,
        ] = await Promise.all([
          shopTimingPromise,
          ratingSummaryPromise,
          userRatingPromise,
          fetchActiveVendorCategories({ vendorId, prisma: this.prisma }),
          fetchPaginatedStoreItems({
            vendorId,
            offset,
            limit,
            categoryId: filterId,
            userId,
            prisma: this.prisma,
          }),
          fetchStoreItemsCount({
            vendorId,
            categoryId: filterId,
            prisma: this.prisma,
          }),
          userId
            ? fetchLastDeliveredOrder({
                prisma: this.prisma,
                userId,
                vendorId,
              })
            : Promise.resolve(null),
        ]);

        totalCount = count;
        const formattedVendor = formatUnifiedVendorProfile({
          vendor,
          ratingSummary,
          shopTiming,
          userId,
        });

        dataPayload = {
          categoryType,
          vendor: formattedVendor,
          categories,
          items,
          lastDeliveredOrder,
          userRating,
        };
        break;
      }
    }

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `unified/storefront/${vendorId}`,
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      statusCode: 200,
      message: 'Unified storefront retrieved successfully',
      data: dataPayload,
      meta,
    });
  }
}
