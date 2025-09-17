import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateBannerVendorItemDto } from './dto/create-banner-vendor-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { MultipleFileUploadInterface } from 'src/vendor/vendor.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UpdateBannerVendorItemDto } from './dto/update-banner-vendor-item.dto';
import { UpdateBannerVendorItemVerification } from './utils/update-banner-vendor-item.utils';
import { BannerVendorItemProductStatusDto } from './dto/banner-vendor-item-productstatus.dto';
import { BannerVendorItemStatusDto } from './dto/banner-vendor-item-status.dto';
import { GetBannerVendorItemQueryDto } from './dto/get-banner-vendor-item-query.dto';
import { buildBannerVendorItemWhereFilter } from './utils/get-banner-vendor-item.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class BannerVendorItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getBannerVendorItem({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetBannerVendorItemQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildBannerVendorItemWhereFilter({
      query,
    });

    const totalCount = await this.prisma.bannerVendorItem.count({ where });

    const bannerVendorItem = await this.prisma.bannerVendorItem.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendor: {
          include: {
            shopInfo: true,
            vendorServiceOption: {
              include: {
                serviceOption: true,
              },
            },
          },
        },
        bannerVendorItemsImage: true,
      },
      orderBy: {
        productstatus: 'asc',
      },
    });

    const queries = buildQueryParams({
      name: query.name,
      bannerVendorItemId: query.bannerVendorItemId,
      productStatus: query.productStatus,
      status: query.status,
      vendorId: query.vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'banner-vendor-item',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: bannerVendorItem,
      meta,
      message: 'Banner Vendor Item retrieved successfully',
      statusCode: 200,
    });
  }

  async createBannerVendorItem({
    res,
    body,
    vendorId,
    images,
  }: {
    res: Response;
    body: CreateBannerVendorItemDto;
    vendorId: string;
    images: Express.Multer.File[];
  }) {
    const initialDate = new Date();

    // item name is unique for this vendor
    const existingItem = await this.getBannerVendorItemByNameAndVendor(
      body.name,
      vendorId,
    );
    if (existingItem) {
      throw new BadRequestException(`${body.name} is already present`);
    }

    // Upload images
    const imageUrls: MultipleFileUploadInterface =
      this.fileUploadService.handleMultipleFileUpload({
        files: images,
        body: { type: ImageTypeEnum.BANNERVENDORITEM },
      });

    try {
      // Step 4: Create banner vendor item
      const bannerItem = await this.prisma.bannerVendorItem.create({
        data: {
          name: body.name,
          description: body.description,
          price: body.price,
          discountPrice: body.discountPrice,
          quantityUnit: body.quantityUnit,
          productstatus: body.productstatus,
          status: body.status,
          vendorId,
          quantity: body.quantity,
          expiryDate: body.expiryDate,
          bannerVendorItemsImage: {
            createMany: {
              data: imageUrls.filePaths.map((fileItem) => ({
                absoluteUrl: fileItem.imageUrl,
                relativeUrl: fileItem.relativePath,
              })),
            },
          },
        },
        include: {
          bannerVendorItemsImage: true,
        },
      });

      return this.responseService.successResponse({
        initialDate,
        res,
        statusCode: 201,
        message: 'Banner vendor item created successfully',
        data: bannerItem,
      });
    } catch (err) {
      // Rollback image uploads on failure
      for (const fileItem of imageUrls.filePaths) {
        this.fileUploadService.handleSingleFileDeletion(fileItem.relativePath);
      }
      throw err;
    }
  }

  async updateBannerVendorItem({
    body,
    vendorId,
    bannerVendorItemId,
    images,
    res,
  }: {
    body: UpdateBannerVendorItemDto;
    vendorId: string;
    bannerVendorItemId: string;
    images?: Express.Multer.File[];
    res: Response;
  }) {
    const initialDate = new Date();

    const { uploadedImages, deletedImages, updateQuery } =
      await UpdateBannerVendorItemVerification({
        body,
        vendorId,
        images,
        fileUploadService: this.fileUploadService,
        bannerVendorItemService: this,
        bannerVendorItemId,
      });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        if (body.deletedItemImageIds) {
          await tx.bannerVendorItemsImage.deleteMany({
            where: {
              id: {
                in: body.deletedItemImageIds,
              },
            },
          });
        }

        const updatedItem = await tx.bannerVendorItem.update({
          where: {
            id: bannerVendorItemId,
          },
          data: updateQuery,
        });

        return updatedItem;
      });

      //delete deleted image
      if (deletedImages) {
        for (const fileItem of deletedImages) {
          this.fileUploadService.handleSingleFileDeletion(fileItem.relativeUrl);
        }
      }

      return this.responseService.successResponse({
        initialDate,
        res,
        data: result,
        message: 'Item updated successfully',
        statusCode: 200,
      });
    } catch (err) {
      if (uploadedImages) {
        for (const fileItem of uploadedImages.filePaths) {
          this.fileUploadService.handleSingleFileDeletion(
            fileItem.relativePath,
          );
        }
      }
      throw err;
    }
  }

  async updateBannerVendorItemProductStatus({
    res,
    bannerVendorItemId,
    body,
    vendorId,
  }: {
    res: Response;
    bannerVendorItemId: string;
    body: BannerVendorItemProductStatusDto;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const bannerVendorItem =
      await this.getBannerVendorItemById(bannerVendorItemId);
    if (!bannerVendorItem) {
      throw new BadRequestException('Banner vendor Item not found');
    }
    if (bannerVendorItem.vendorId !== vendorId) {
      throw new ForbiddenException(
        'You are not authorized to update this item.',
      );
    }

    const updatedBannerVendorItem = await this.prisma.bannerVendorItem.update({
      where: {
        id: bannerVendorItemId,
      },
      data: {
        productstatus: body.productstatus,
      },
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      data: updatedBannerVendorItem,
      message: 'Product status updated successfully',
      statusCode: 200,
    });
  }

  async updateBannerVendorItemStatus({
    res,
    bannerVendorItemId,
    body,
    vendorId,
  }: {
    res: Response;
    bannerVendorItemId: string;
    body: BannerVendorItemStatusDto;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const bannerVendorItem =
      await this.getBannerVendorItemById(bannerVendorItemId);
    if (!bannerVendorItem) {
      throw new BadRequestException('Banner vendor Item not found');
    }
    if (bannerVendorItem.vendorId !== vendorId) {
      throw new ForbiddenException(
        'You are not authorized to update this item.',
      );
    }

    const updatedBannerVendorItem = await this.prisma.bannerVendorItem.update({
      where: {
        id: bannerVendorItemId,
      },
      data: {
        status: body.status,
      },
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      data: updatedBannerVendorItem,
      message: 'Status updated successfully',
      statusCode: 200,
    });
  }

  async deleteBannerVendorItem({
    res,
    bannerVendorItemId,
    vendorId,
  }: {
    res: Response;
    bannerVendorItemId: string;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const bannerVendorItem =
      await this.getBannerVendorItemById(bannerVendorItemId);
    if (!bannerVendorItem) {
      throw new BadRequestException('Banner vendor Item not found');
    }
    if (bannerVendorItem.vendorId !== vendorId) {
      throw new ForbiddenException(
        'You are not authorized to update this item.',
      );
    }

    const deletedBannerVendorItem = await this.prisma.bannerVendorItem.delete({
      where: {
        id: bannerVendorItemId,
      },
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      data: deletedBannerVendorItem,
      message: 'BannervendorItem deleted successfully',
      statusCode: 200,
    });
  }

  /*----- helper func -----*/
  async getBannerVendorItemByNameAndVendor(name: string, vendorId: string) {
    return await this.prisma.bannerVendorItem.findUnique({
      where: {
        vendorId_name: {
          name,
          vendorId,
        },
      },
    });
  }

  async getBannerVendorItemById(id: string) {
    return await this.prisma.bannerVendorItem.findUnique({
      where: {
        id,
      },
    });
  }

  async findBannerVendorItemImages(itemImagesId: string[]) {
    return await this.prisma.bannerVendorItemsImage.findMany({
      where: {
        id: {
          in: itemImagesId,
        },
      },
    });
  }
}
