import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UpdateBannerVendorItemDto } from '../dto/update-banner-vendor-item.dto';
import { BannerVendorItemService } from '../banner-vendor-item.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BannerVendorItemsImage, Prisma } from '@prisma/client';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { ProductUnitService } from 'src/product-unit/product-unit.service';

export const UpdateBannerVendorItemVerification = async ({
  body,
  vendorId,
  images,
  fileUploadService,
  bannerVendorItemService,
  bannerVendorItemId,
  productUnitService,
}: {
  body: UpdateBannerVendorItemDto;
  vendorId: string;
  images?: Express.Multer.File[];
  fileUploadService: FileUploadService;
  bannerVendorItemService: BannerVendorItemService;
  bannerVendorItemId: string;
  productUnitService: ProductUnitService;
}) => {
  //Fetch existing banner vendor item
  const existingItem =
    await bannerVendorItemService.getBannerVendorItemById(bannerVendorItemId);

  if (!existingItem) {
    throw new NotFoundException('Banner Vendor Item not found');
  }

  if (existingItem.vendorId !== vendorId) {
    throw new ForbiddenException('You are not authorized to update this item.');
  }

  if (body.productUnitId) {
    const productUnit = await productUnitService.getProductUnitById(
      body.productUnitId,
    );
    if (!productUnit || productUnit.status == 'INACTIVE') {
      throw new BadRequestException('Product Unit is inavlid');
    }
  }

  // Check if name is being updated and verify uniqueness
  if (body.name) {
    const existingWithName =
      await bannerVendorItemService.getBannerVendorItemByNameAndVendor(
        body.name,
        vendorId,
      );

    if (existingWithName && existingWithName.id !== bannerVendorItemId) {
      throw new BadRequestException(
        `Item with the name ${body.name} already exists`,
      );
    }
  }

  //Validate price and discountPrice
  if (body.price || body.discountPrice) {
    const priceToCompare = body.price ?? existingItem.price;
    const discountPriceToCompare =
      body.discountPrice ?? existingItem.discountPrice;

    if (discountPriceToCompare && priceToCompare <= discountPriceToCompare) {
      throw new BadRequestException(
        'Price must be greater than the discount price',
      );
    }
  }

  const { deletedItemImageIds } = body;
  let deletedImages: BannerVendorItemsImage[] = [];
  //check deleted images
  if (deletedItemImageIds) {
    deletedImages =
      await bannerVendorItemService.findBannerVendorItemImages(
        deletedItemImageIds,
      );
    if (deletedImages.length !== deletedItemImageIds.length) {
      throw new BadRequestException(
        'Apologies for the reason.Some of the Deleted Image Ids not found',
      );
    }
  }

  //Handle image uploads (if any)
  const uploadedImages =
    images && images.length > 0
      ? fileUploadService.handleMultipleFileUpload({
          files: images,
          body: { type: ImageTypeEnum.BANNERVENDORITEM },
        })
      : undefined;

  const updateQuery: Prisma.BannerVendorItemUpdateInput = {
    ...(body.name && { name: body.name }),
    ...(body.description && { description: body.description }),
    ...(body.price && { price: body.price }),
    ...(body.discountPrice && { discountPrice: body.discountPrice }),
    ...(body.productUnitId && {
      productUnit: {
        connect: {
          id: body.productUnitId,
        },
      },
    }),
    ...(body.productstatus && { productstatus: body.productstatus }),
    ...(body.status && { status: body.status }),
    ...(body.quantity && { quantity: body.quantity }),
    ...(body.expiryDate && { expiryDate: body.expiryDate }),
    ...(uploadedImages && {
      bannerVendorItemsImage: {
        createMany: {
          data: uploadedImages.filePaths.map((file) => ({
            absoluteUrl: file.imageUrl,
            relativeUrl: file.relativePath,
          })),
        },
      },
    }),
  };

  return {
    uploadedImages,
    deletedImages,
    updateQuery,
  };
};
