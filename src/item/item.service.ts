import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from 'src/category/category.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { SubCategoryService } from 'src/sub-category/sub-category.service';
import { CreateItemDto } from './dto/create-item.dto';
import { Response } from 'express';
import {
  MultipleFileUploadInterface,
  VendorService,
} from 'src/vendor/vendor.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UpdateItemDto } from './dto/update-item.dto';
import { Prisma, ProductStatus, VendorSubscription } from '@prisma/client';
import { UpdateProductStatusDto } from './dto/update-productstatus-item.dto';
import { UpdateItemStatus } from './dto/update-itemstatus.dto';
import { MetadataService } from 'src/metadata/metadata.service';
import { buildItemWhereFilter } from './function/getServicehelper';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { GetItemQueryDto } from './dto/get-item-query.dto';
import { UpdateItemVerification } from './utils/update-item.utils';
import { getItemWithAvgRating, includeItem } from './utils/get-item.utils';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

@Injectable()
export class ItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly categoryService: CategoryService,
    private readonly subCategoryService: SubCategoryService,
    private readonly vendorService: VendorService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {}

  async getItem({
    res,
    offset,
    limit,
    query,
    userId,
  }: {
    res: Response;
    offset: number;
    limit: number;
    query: GetItemQueryDto;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where = buildItemWhereFilter({
      query,
    });

    const totalCount = await this.prisma.item.count({ where });

    const items = await this.prisma.item.findMany({
      where,
      skip: offset,
      take: limit,
      include: includeItem(userId),
      orderBy: {
        productstatus: 'asc',
      },
    });

    const itemWithVendor = await getItemWithAvgRating({
      items,
      prisma: this.prisma,
    });

    const queries = buildQueryParams({
      categoryName: query.categoryName,
      subCategoryName: query.subCategoryName,
      vendorId: query.vendorId,
      itemName: query.itemName,
      categoryId: query.categoryId,
      subCategoryId: query.subCategoryId,
      itemStatus: query.itemStatus,
      vendorStatus: query.vendorStatus,
      shopStatus: query.shopStatus,
      ProductStatus: query.productStatus,
      itemId: query.itemId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'item',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: itemWithVendor,
      meta,
      message: 'Items retrieved successfully',
      statusCode: 200,
    });
  }

  async getPopularItem({
    res,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where: Prisma.ItemWhereInput = {
      vendor: {
        User: {
          status: true,
        },
        shopInfo: {
          isShopOpen: true,
        },
        vendorType: {
          type: 'PRODUCT',
        },
      },
    };
    const totalCount = await this.prisma.item.count({ where });

    const items = await this.prisma.item.findMany({
      where,
      skip: offset,
      take: limit,
      include: includeItem(userId),
      orderBy: {
        productstatus: 'asc',
      },
    });

    const itemWithVendor = await getItemWithAvgRating({
      items,
      prisma: this.prisma,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'item/popular',
    });

    return this.responseService.successResponse({
      res,
      data: itemWithVendor,
      meta,
      message: 'Popular Items retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createItem({
    body,
    res,
    itemImages,
    vendorId,
  }: {
    body: CreateItemDto;
    res: Response;
    itemImages: Express.Multer.File[];
    vendorId: string;
  }) {
    const initialDate = new Date();

    const { categoryId, subCategoryId } = body;
    //check vendor
    const vendor = await this.vendorService.findVendorById({ id: vendorId });
    if (!vendor) {
      throw new NotFoundException('Invalid vendorId');
    }
    //check category
    const category = await this.categoryService.findCategoryByVendorType({
      vendorTypeId: vendor.vendorTypeId,
      categoryId,
    });
    if (!category) {
      throw new NotFoundException(
        'Category Not found or not associated with Selected VendorType of Vendor',
      );
    }
    //check subcategory
    const subCategory =
      await this.subCategoryService.getSubCategoryByIdAndCategory({
        subCategoryId,
        categoryId,
      });
    if (!subCategory) {
      throw new NotFoundException(
        'Subcategory not found or not associated with categoryId',
      );
    }
    //upload image
    const imageUrls: MultipleFileUploadInterface =
      this.fileUploadService.handleMultipleFileUpload({
        files: itemImages,
        body: { type: ImageTypeEnum.ITEM },
      });
    //check unique name
    if (await this.findItemByName(body.name, vendorId)) {
      throw new BadRequestException(`${body.name} is already present`);
    }
    try {
      const item = await this.prisma.item.create({
        data: {
          name: body.name,
          description: body.description,
          price: body.price,
          discountPrice: body.discountPrice,
          productUnitId: body.productUnitId,
          remainingQty: body.dailyTotalQty,
          dailyTotalQty: body.dailyTotalQty,
          minSellingQty: body.minSellingQty,
          categoryId,
          subCategoryId,
          vendorId,
          expiryDate: body.expiryDate,
          nameTamil: body.nameTamil,
          descriptionTamil: body.descriptionTamil,
          itemImage: {
            createMany: {
              data: imageUrls.filePaths.map((fileItem) => ({
                absoluteUrl: fileItem.imageUrl,
                relativeUrl: fileItem.relativePath,
              })),
            },
          },
        },
        include: {
          itemImage: true,
        },
      });

      return this.responseService.successResponse({
        initialDate,
        res,
        data: item,
        message: 'Item created successfully',
        statusCode: 201,
      });
    } catch (err) {
      // Rollback: Delete uploaded files if user creation fails
      for (const fileItem of imageUrls.filePaths) {
        this.fileUploadService.handleSingleFileDeletion(fileItem.relativePath);
      }
      throw err;
    }
  }

  async updateItem({
    itemId,
    body,
    res,
    itemImages,
    vendorId,
    currentSubscription,
  }: {
    itemId: string;
    vendorId: string;
    body: UpdateItemDto;
    res: Response;
    itemImages?: Express.Multer.File[];
    currentSubscription: VendorSubscription;
  }) {
    const initialDate = new Date();
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    const item = await this.findItemByVendor({ itemId, vendorId });
    if (!item) {
      throw new NotFoundException(
        'Item not found or item is not associated with vendor',
      );
    }

    //verifications
    const {
      updatedRemainingQty,
      totalQtyEditCount,
      deletedImages,
      updateVendorUsageQuery,
    } = await UpdateItemVerification({
      body,
      item,
      categoryService: this.categoryService,
      subCategoryService: this.subCategoryService,
      itemService: this,
      vendorId,
      currentVendorSubscription: currentSubscription,
      vendorSubscriptionService: this.vendorSubscriptionService,
    });

    const uploadedImage: MultipleFileUploadInterface | undefined =
      itemImages && itemImages.length > 0
        ? this.fileUploadService.handleMultipleFileUpload({
            files: itemImages,
            body: { type: ImageTypeEnum.ITEM },
          })
        : undefined;

    // Construct update query
    const updateQuery = {
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.price && { price: body.price }),
        ...(body.discountPrice && { discountPrice: body.discountPrice }),
        ...(body.productUnitId && { productUnitId: body.productUnitId }),
        ...(body.dailyTotalQty && { dailyTotalQty: body.dailyTotalQty }),
        ...(body.minSellingQty && { minSellingQty: body.minSellingQty }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.subCategoryId && { subCategoryId: body.subCategoryId }),
        ...(body.status && { status: body.status }),
        ...(body.expiryDate && { expiryDate: body.expiryDate }),
        ...(body.nameTamil && { nameTamil: body.nameTamil }),
        ...(body.descriptionTamil && {
          descriptionTamil: body.descriptionTamil,
        }),
        remainingQty: updatedRemainingQty,
        totalQtyEditCount: totalQtyEditCount,
        ...(uploadedImage && {
          itemImage: {
            createMany: {
              data: uploadedImage.filePaths.map((fileItem) => ({
                absoluteUrl: fileItem.imageUrl,
                relativeUrl: fileItem.relativePath,
              })),
            },
          },
        }),
      },
    };

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        //update new Image
        const updatedItem = await tx.item.update({
          where: { id: itemId },
          ...updateQuery,
          include: {
            itemImage: true,
          },
        });

        if (body.deletedItemImageIds) {
          await tx.itemImage.deleteMany({
            where: {
              id: {
                in: body.deletedItemImageIds,
              },
            },
          });
        }

        if (updateVendorUsageQuery) {
          await tx.vendorFeatureUsage.update(updateVendorUsageQuery);
        }

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
      if (uploadedImage) {
        for (const fileItem of uploadedImage.filePaths) {
          this.fileUploadService.handleSingleFileDeletion(
            fileItem.relativePath,
          );
        }
      }
      throw err;
    }
  }

  async changeProductStatus({
    res,
    vendorId,
    itemId,
    body,
    currentVendorSubscription,
  }: {
    res: Response;
    vendorId: string;
    itemId: string;
    body: UpdateProductStatusDto;
    currentVendorSubscription: VendorSubscription;
  }) {
    const initialDate = new Date();

    const item = await this.findItemByVendor({
      itemId,
      vendorId,
    });

    if (!item) {
      throw new NotFoundException(
        'Item not found or item is not associated with vendor',
      );
    }
    if (item.remainingQty === 0 && body.status === ProductStatus.AVAILABLE) {
      throw new BadRequestException(
        'Item cannot be set to AVAILABLE because it has no remaining qty for today',
      );
    }

    //checking product status limit
    const vendorFeatureUsageForProductStatusUpdate =
      await this.vendorSubscriptionService.getOrCreateFeatureUsage({
        vendorSubscriptionId: currentVendorSubscription.id,
        itemId: item.id,
        feature: 'productStatusChangeLimit',
      });
    const planStatusUpdateLimit = (
      vendorFeatureUsageForProductStatusUpdate.vendorSubscription
        .planFeatures as Record<string, any>
    )['productStatusChangeLimit'] as number | null;
    if (!planStatusUpdateLimit) {
      throw new BadRequestException('You are not allowed to update the Status');
    }
    if (
      vendorFeatureUsageForProductStatusUpdate.usageCount >=
      planStatusUpdateLimit
    ) {
      throw new BadRequestException(
        'You have reached the limit to update the Status',
      );
    }

    const updatedItem = await this.prisma.$transaction(async (tx) => {
      await tx.vendorFeatureUsage.update({
        where: {
          id: vendorFeatureUsageForProductStatusUpdate.id,
        },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });

      return await tx.item.update({
        where: { id: itemId },
        data: { productstatus: body.status },
        include: { itemImage: true },
      });
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: updatedItem,
      message: 'Item status updated successfully',
      statusCode: 200,
    });
  }

  async changeItemStatus({
    res,
    vendorId,
    itemId,
    body,
  }: {
    res: Response;
    vendorId: string;
    itemId: string;
    body: UpdateItemStatus;
  }) {
    const initialDate = new Date();
    const item = await this.findItemByVendor({
      itemId,
      vendorId,
    });

    if (!item) {
      throw new NotFoundException(
        'Item not found or item is not associated with vendor',
      );
    }

    const updatedItem = await this.prisma.item.update({
      where: { id: itemId },
      data: { status: body.status },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: updatedItem,
      message: 'Item status updated successfully',
      statusCode: 200,
    });
  }

  async deleteItem({
    vendorId,
    itemId,
    res,
  }: {
    vendorId: string;
    itemId: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const item = await this.findItemByVendor({
      itemId,
      vendorId,
    });

    if (!item) {
      throw new NotFoundException(
        'Item not found or item not associated with vendor',
      );
    }

    if (item.orderItems.length > 0) {
      throw new BadRequestException(
        'Item cannot be deleted while it has orders.So you can only Inactive the item',
      );
    }

    const deletedItem = await this.prisma.item.delete({
      where: {
        id: itemId,
      },
    });

    for (const itemImage of item.itemImage) {
      this.fileUploadService.handleSingleFileDeletion(itemImage.relativeUrl);
    }

    return this.responseService.successResponse({
      initialDate,
      res,
      data: deletedItem,
      message: 'Item updated successfully',
      statusCode: 200,
    });
  }

  /*----- helper func -----*/

  async getItemById(itemId: string) {
    return await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        vendor: {
          include: {
            shopInfo: {
              include: {
                shopCategory: true,
                shopCity: true,
              },
            },
            User: true,
          },
        },
        category: true,
        subCategory: true,
        itemImage: {
          select: {
            absoluteUrl: true,
            relativeUrl: true,
          },
        },
        orderItems: true,
      },
    });
  }

  async findItemByVendor({
    vendorId,
    itemId,
  }: {
    vendorId: string;
    itemId: string;
  }) {
    const item = await this.prisma.item.findFirst({
      where: {
        id: itemId,
        vendorId,
      },
      include: {
        vendor: true,
        category: true,
        subCategory: true,
        itemImage: true,
        orderItems: true,
      },
    });

    return item;
  }

  async findItemByName(name: string, vendorId: string) {
    return await this.prisma.item.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        vendorId,
      },
    });
  }

  async findItemImages(itemImagesId: string[]) {
    return await this.prisma.itemImage.findMany({
      where: {
        id: {
          in: itemImagesId,
        },
      },
    });
  }
}
