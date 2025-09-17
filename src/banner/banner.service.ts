import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import {
  MultipleFileUploadInterface,
  VendorService,
} from 'src/vendor/vendor.service';
import { Banner, BannerStatus, BannerType, Prisma } from '@prisma/client';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { UpdateBannerStatusDto } from './dto/updatestatus-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import {
  cleanupOldImages,
  getImageUpdateFields,
  rollbackImageUpload,
} from './utils/bannerhelper';
import { buildBannerWhereFilter } from './utils/banner-wherefilter';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { ItemService } from 'src/item/item.service';
import {
  buildCreateBannerData,
  CreateBannerValidation,
} from './utils/create-banner.utils';
import { KeywordService } from 'src/keyword/keyword.service';
import {
  buildUpdateBannerData,
  UpdateBannerValidation,
} from './utils/update-banner.utils';
import { GetBannerForAdminQueryDto } from './dto/get-banner-for-admin.dto';
import { buildBannerForAdminWhereFilter } from './utils/get-banner-for-admin-filter';

@Injectable()
export class BannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly fileUploadService: FileUploadService,
    private readonly vendorService: VendorService,
    private readonly itemService: ItemService,
    private readonly keywordService: KeywordService,
  ) {}

  /*---- Get Banners -----*/
  async getRegularBanner({
    res,
    name,
    vendorId,
    status,
    offset,
    limit,
    inDateRange = true,
    shopName,
    keywordId,
    latitude,
    longitude,
  }: {
    res: Response;
    name?: string;
    vendorId?: string;
    status?: BannerStatus | 'ALL';
    offset: number;
    limit: number;
    inDateRange?: boolean;
    shopName?: string;
    keywordId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const initialDate = new Date();

    const where = await buildBannerWhereFilter({
      name,
      status,
      vendorId,
      inDateRange,
      bannerType: BannerType.REGULAR,
      keywordService: this.keywordService,
      keywordId,
      latitude,
      longitude,
      prisma: this.prisma,
    });

    const totalCount = await this.prisma.banner.count({ where });

    const banners = await this.prisma.banner.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },

      include: {
        vendor: {
          include: {
            shopInfo: true,
          },
        },
        keyWordBanner: {
          include: {
            keyWord: true,
          },
        },
        bannerItemImages: true,
      },
    });

    const queries = buildQueryParams({
      name,
      vendorId,
      status,
      inDateRange: inDateRange ? 'true' : 'false',
      shopName,
      keywordId,
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
    });

    const meta = this.metaDataService.createMetaData({
      queries,
      totalCount,
      offset,
      limit,
      path: 'banner/regular',
    });

    return this.response.successResponse({
      res,
      data: banners,
      meta,
      message: 'Regular banners retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getProductBanner({
    res,
    name,
    vendorId,
    status,
    offset,
    limit,
    inDateRange = true,
    shopName,
    keywordId,
    latitude,
    longitude,
  }: {
    res: Response;
    name?: string;
    vendorId?: string;
    status?: BannerStatus | 'ALL';
    offset: number;
    limit: number;
    inDateRange?: boolean;
    shopName?: string;
    keywordId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const initialDate = new Date();
    const where = await buildBannerWhereFilter({
      name,
      status,
      vendorId,
      inDateRange,
      bannerType: BannerType.PRODUCT,
      shopName,
      keywordService: this.keywordService,
      keywordId,
      latitude,
      longitude,
      prisma: this.prisma,
    });

    const totalCount = await this.prisma.banner.count({ where });

    const banners = await this.prisma.banner.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          include: {
            shopInfo: true,
          },
        },
        keyWordBanner: {
          include: {
            keyWord: true,
          },
        },
        bannerItemImages: true,
      },
    });

    const queries = buildQueryParams({
      name,
      vendorId,
      status,
      keywordId,
      inDateRange: inDateRange ? 'true' : 'false',
      shopName,
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
    });

    const meta = this.metaDataService.createMetaData({
      queries,
      totalCount,
      offset,
      limit,
      path: 'banner/product',
    });

    return this.response.successResponse({
      res,
      data: banners,
      meta,
      message: 'Product banners retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getBannerForAdmin({
    res,
    query,
    type,
    offset,
    limit,
  }: {
    res: Response;
    query: GetBannerForAdminQueryDto;
    type: BannerType;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildBannerForAdminWhereFilter({
      query,
      bannerType: type,
    });

    const totalCount = await this.prisma.banner.count({ where });
    // const include = getIncludeVendorUtilsForAdmin();

    const banners = await this.prisma.banner.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendor: {
          include: {
            shopInfo: true,
          },
        },
        keyWordBanner: {
          include: {
            keyWord: true,
          },
        },
        bannerItemImages: true,
      },
      orderBy: [{ status: 'asc' }, { endDateTime: 'desc' }],
    });

    const { shopName, bannerName } = query;
    const queries = buildQueryParams({ shopName, bannerName });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `banner/getAllBanner/admin`,
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: banners,
      meta,
      message: 'Vendor retrieved successfully',
      statusCode: 200,
    });
  }

  async getBannerById({ res, bannerId }: { res: Response; bannerId: string }) {
    const initialDate = new Date();
    const banner = await this.findBannerById(bannerId);

    return this.response.successResponse({
      res,
      data: banner,
      message: 'Banner retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getPopularityBanner({
    res,
    offset,
    limit,
    bannerType,
  }: {
    res: Response;
    offset: number;
    limit: number;
    bannerType: BannerType;
  }) {
    const initialDate = new Date();
    const where = await buildBannerWhereFilter({
      inDateRange: true,
      bannerType,
      keywordService: this.keywordService,
      prisma: this.prisma,
    });
    const totalCount = await this.prisma.banner.count({ where });

    const banners = await this.prisma.banner.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },

      include: {
        vendor: {
          include: {
            shopInfo: true,
          },
        },
        keyWordBanner: {
          include: {
            keyWord: true,
          },
        },
        bannerItemImages: true,
      },
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `banner/popular/${bannerType === 'REGULAR' ? 'product' : 'service'}`,
    });

    return this.response.successResponse({
      res,
      data: banners,
      meta,
      message: 'Popular banners retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*---- Create Banner ----*/
  async createBanner({
    vendorId,
    res,
    body,
    itemImages,
    fgImage,
    bgImage,
  }: {
    vendorId: string;
    res: Response;
    body: CreateBannerDto;
    itemImages: Express.Multer.File[];
    fgImage?: Express.Multer.File;
    bgImage?: Express.Multer.File;
  }) {
    const initialDate = new Date();

    //validation
    const { bannerType } = await CreateBannerValidation({
      bannerService: this,
      vendorService: this.vendorService,
      body,
      vendorId,
      keywordService: this.keywordService,
    });

    //upload images
    // file is Express.Multer.File  => type predicate
    const imageFiles = [fgImage, bgImage]
      .filter((file): file is Express.Multer.File => Boolean(file))
      .flat();

    if (imageFiles.length === 0) {
      throw new BadRequestException(
        'Either fgImage(Foreground Image) or bgImage(Background Image) is required',
      );
    }

    const imageUrls: MultipleFileUploadInterface =
      this.fileUploadService.handleMultipleFileUpload({
        files: imageFiles,
        body: { type: ImageTypeEnum.BANNER },
      });

    //BannerProduct Image
    const bannerProductImage: MultipleFileUploadInterface | undefined =
      itemImages.length > 0
        ? this.fileUploadService.handleMultipleFileUpload({
            files: itemImages,
            body: { type: ImageTypeEnum.BANNERPRODUCT },
          })
        : undefined;

    const createBannerQuery = buildCreateBannerData({
      vendorId,
      bannerType,
      body,
      ...getImageUpdateFields(fgImage, bgImage, imageUrls),
      bannerProductImage,
    });

    try {
      const banner = await this.prisma.banner.create({
        data: createBannerQuery,
        include: {
          bannerItemImages: true,
          keyWordBanner: {
            include: {
              keyWord: true,
            },
          },
        },
      });

      return this.response.successResponse({
        res,
        initialDate,
        statusCode: 200,
        message: 'Banner created successfully',
        data: banner,
      });
    } catch (err) {
      rollbackImageUpload({
        imageUrls,
        bannerProductImage,
        fileUploadService: this.fileUploadService,
      });
      throw err;
    }
  }

  /*---- Update Banner -----*/
  async updateBanner({
    res,
    body,
    bannerId,
    vendorId,
    itemImages,
    fgImage,
    bgImage,
  }: {
    res: Response;
    body: UpdateBannerDto;
    bannerId: string;
    vendorId: string;
    itemImages?: Express.Multer.File[] | null;
    fgImage?: Express.Multer.File[] | null;
    bgImage?: Express.Multer.File[] | null;
  }) {
    const initialDate = new Date();
    if (
      !body ||
      (Object.keys(body).length == 0 &&
        itemImages === undefined &&
        fgImage === undefined &&
        bgImage === undefined)
    ) {
      throw new BadRequestException('No valid fields are provided to update');
    }

    //verification
    const { banner, deletedBannerItemImages } = await UpdateBannerValidation({
      bannerService: this,
      body,
      vendorId,
      bannerId,
    });

    //check fg ground and bg image
    const imageFiles = [fgImage, bgImage]
      .filter((file): file is Express.Multer.File[] => Boolean(file))
      .flat();

    const imageUrls: MultipleFileUploadInterface | undefined =
      imageFiles.length > 0
        ? this.fileUploadService.handleMultipleFileUpload({
            files: imageFiles,
            body: { type: ImageTypeEnum.BANNER },
          })
        : undefined;
    const bannerProductImage: MultipleFileUploadInterface | undefined =
      itemImages && itemImages.length > 0
        ? this.fileUploadService.handleMultipleFileUpload({
            files: itemImages,
            body: { type: ImageTypeEnum.BANNERPRODUCT },
          })
        : undefined;

    const updateQuery: Prisma.BannerUpdateInput = buildUpdateBannerData({
      body,
      bannerProductImage,
      ...((fgImage || bgImage) &&
        getImageUpdateFields(fgImage, bgImage, imageUrls)),
    });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        //delete itemImages
        if (body.deletedItemImageIds && body.deletedItemImageIds.length > 0) {
          await tx.bannerItemImages.deleteMany({
            where: {
              id: {
                in: body.deletedItemImageIds,
              },
            },
          });
        }
        //delete keywords
        if (body.keyWordIds && body.keyWordIds.length > 0) {
          await tx.keywordBanner.deleteMany({
            where: {
              bannerId,
            },
          });
        }
        //update banner
        const updatedBanner = await tx.banner.update({
          where: { id: bannerId },
          data: updateQuery,
          include: {
            bannerItemImages:
              itemImages != null || body.deletedItemImageIds ? true : false,
            keyWordBanner: {
              include: {
                keyWord: true,
              },
            },
          },
        });
        return updatedBanner;
      });

      cleanupOldImages({
        banner,
        fgImage,
        bgImage,
        fileUploadService: this.fileUploadService,
        deletedBannerItemImages,
      });

      return this.response.successResponse({
        res,
        initialDate,
        statusCode: 200,
        message: 'Banner updated successfully',
        data: result,
      });
    } catch (err) {
      rollbackImageUpload({
        imageUrls,
        bannerProductImage,
        fileUploadService: this.fileUploadService,
      });
      throw err;
    }
  }

  async checkBannerByName({
    name,
    vendorId,
    id,
  }: {
    name: string;
    vendorId: string;
    id?: string;
  }) {
    const banner = await this.prisma.banner.findFirst({
      where: {
        name,
        vendorId,
        ...(id ? { not: id } : {}),
      },
    });

    return banner;
  }

  async updatedBannerStatus({
    res,
    body,
    bannerId,
    vendorId,
  }: {
    res: Response;
    body: UpdateBannerStatusDto;
    bannerId: string;
    vendorId: string;
  }) {
    const initialDate = new Date();

    //check banner is associated with vendor
    const banner = await this.checkBannerByVendor({
      vendorId,
      bannerId,
    });
    if (!banner) {
      throw new BadRequestException(
        'Banner not found or not associated with Vendor',
      );
    }

    const updatedStatus = await this.prisma.banner.update({
      where: { id: bannerId },
      data: { status: body.status },
    });

    return this.response.successResponse({
      res,
      initialDate,
      statusCode: 200,
      message: 'Banner status updated successfully',
      data: updatedStatus,
    });
  }

  async deleteBanner({
    res,
    bannerId,
    vendorId,
  }: {
    res: Response;
    bannerId: string;
    vendorId: string;
  }) {
    const initialDate = new Date();

    //check banner is associated with vendor
    const banner = await this.checkBannerByVendor({
      vendorId,
      bannerId,
    });
    if (!banner) {
      throw new BadRequestException(
        'Banner not found or not associated with Vendor',
      );
    }

    const deletedBanner = await this.prisma.banner.delete({
      where: { id: bannerId },
      include: { bannerItemImages: true },
    });

    cleanupOldImages({
      banner,
      fgImage: banner.fgImageRelativeUrl,
      bgImage: banner.bgImageRelativeUrl,
      fileUploadService: this.fileUploadService,
      deletedBannerItemImages: banner.bannerItemImages,
    });

    return this.response.successResponse({
      res,
      initialDate,
      statusCode: 200,
      message: 'Banner deleted successfully',
      data: deletedBanner,
    });
  }

  /*----- helper query -----*/
  async checkBannerByVendor({
    bannerId,
    vendorId,
  }: {
    bannerId: string;
    vendorId: string;
  }) {
    const banner = await this.prisma.banner.findFirst({
      where: {
        id: bannerId,
        vendorId,
      },
      include: {
        bannerItemImages: true,
        vendor: {
          include: {
            vendorType: true,
          },
        },
      },
    });
    return banner;
  }

  async getBannerByVendor(vendorId: string, bannerId: string) {
    const banner = await this.prisma.banner.findFirst({
      where: {
        id: bannerId,
        vendor: {
          id: vendorId,
        },
      },
    });
    return banner;
  }

  async findBestBanner(totalAmount: number, vendorId: string) {
    const currentTime = new Date();

    // const availableBanners = await this.prisma.banner.findMany({})

    const banners = await this.prisma.banner.findMany({
      where: {
        vendorId,
        bannerType: BannerType.PRODUCT,
        status: 'ACTIVE',
        startDateTime: {
          lte: currentTime,
        },
        endDateTime: {
          gte: currentTime,
        },
        minApplyValue: {
          lte: totalAmount,
        },
      },
    });

    // console.log(banners);

    let bestBanner: Banner | null = null;
    let maxDiscount = 0;
    for (const banner of banners) {
      let discount = 0;

      if (banner.offerType === 'FLAT') {
        discount = banner.offerValue;
      } else if (banner.offerType === 'PERCENTAGE') {
        discount = Math.floor((banner.offerValue / 100) * totalAmount);
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestBanner = banner;
      }
    }

    const discountedAmount = totalAmount - maxDiscount;

    return {
      bestBanner,
      originalTotal: totalAmount,
      finalTotal: discountedAmount,
      discountValue: maxDiscount,
    };
  }

  async checkIsBannerValid({
    bannerId,
    totalAmount,
    vendorId,
  }: {
    bannerId: string;
    totalAmount: number;
    vendorId: string;
  }) {
    const currentTime = new Date();
    const banner = await this.prisma.banner.findFirst({
      where: {
        id: bannerId,
        vendorId,
        bannerType: BannerType.PRODUCT,
        status: 'ACTIVE',
        startDateTime: {
          lte: currentTime,
        },
        endDateTime: {
          gte: currentTime,
        },
        minApplyValue: {
          lte: totalAmount,
        },
      },
    });
    return banner;
  }

  async findBannerById(bannerId: string) {
    return await this.prisma.banner.findUnique({
      where: { id: bannerId },
      include: {
        vendor: true,
        bannerItemImages: true,
        keyWordBanner: {
          include: {
            keyWord: true,
          },
        },
      },
    });
  }

  async findBannerForBooking(bannerId: string) {
    const currentDateTime = new Date();

    return await this.prisma.banner.findUnique({
      where: {
        id: bannerId,
        startDateTime: {
          lte: currentDateTime,
        },
        endDateTime: {
          gte: currentDateTime,
        },
      },
      include: {
        vendor: {
          include: {
            User: true,
          },
        },
        bannerItemImages: true,
      },
    });
  }

  async findBannerItemImages(bannerItemImageIds: string[]) {
    return await this.prisma.bannerItemImages.findMany({
      where: {
        id: {
          in: bannerItemImageIds,
        },
      },
    });
  }
}
