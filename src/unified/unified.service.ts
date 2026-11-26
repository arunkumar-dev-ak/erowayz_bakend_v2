import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { VendorRatingService } from 'src/vendor-rating/vendor-rating.service';
import { GetUnifiedProductInfoQueryDto } from './dto/get-unified-product-info-query.dto';
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

@Injectable()
export class UnifiedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vendorRatingService: VendorRatingService,
    private readonly responseService: ResponseService,
    private readonly metadataService: MetadataService,
  ) {}

  /**
   * Unified Product Vendor Storefront Details (Product Info)
   */
  async getProductInfo({
    vendorId,
    query,
    userId,
    res,
  }: {
    vendorId: string;
    query: GetUnifiedProductInfoQueryDto;
    userId?: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const offset = Number(query.offset ?? 0);
    const limit = Number(query.limit ?? 10);

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

    /*----- Parallel execution using product utils -----*/
    const [
      shopTiming,
      categories,
      items,
      totalCount,
      ratingSummary,
      lastDeliveredOrder,
      userRating,
    ] = await Promise.all([
      // 1. Shop Timings
      fetchShopTimings({ vendorId, prisma: this.prisma }),

      // 2. Available Categories with active items
      fetchActiveVendorCategories({ vendorId, prisma: this.prisma }),

      // 3. Paginated Menu Items with ratings
      fetchPaginatedStoreItems({
        vendorId,
        offset,
        limit,
        userId,
        prisma: this.prisma,
      }),

      // 4. Total item count for pagination
      fetchStoreItemsCount({ vendorId, prisma: this.prisma }),

      // 5. Vendor rating summary (cached in Redis)
      this.vendorRatingService.getVendorRatingSummary(vendorId, categoryType),

      // 6. User's last completed/delivered order (if authenticated)
      userId
        ? fetchLastDeliveredOrder({
            prisma: this.prisma,
            userId,
            vendorId,
          })
        : Promise.resolve(null),

      // 7. User's existing rating (if authenticated)
      userId
        ? fetchCustomerExistingRating({
            prisma: this.prisma,
            userId,
            vendorId,
          })
        : Promise.resolve(null),
    ]);

    // Format vendor profile
    const formattedVendor = formatUnifiedVendorProfile({
      vendor,
      ratingSummary,
      shopTiming,
      userId,
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `unified/product-info/${vendorId}`,
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      statusCode: 200,
      message: 'Unified product info retrieved successfully',
      data: {
        vendor: formattedVendor,
        categories,
        items,
        lastDeliveredOrder,
        userRating,
      },
      meta,
    });
  }
}
