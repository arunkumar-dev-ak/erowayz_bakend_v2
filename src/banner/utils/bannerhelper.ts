import { MultipleFileUploadInterface } from 'src/vendor/vendor.service';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import {
  Banner,
  BannerItemImages,
  BannerType,
  VendorCategoryType,
  VendorType,
} from '@prisma/client';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { BadRequestException } from '@nestjs/common';

export function getBannerType(vendorType: VendorCategoryType) {
  let bannerType: BannerType | undefined = undefined;
  if (vendorType === VendorCategoryType.BANNER) {
    bannerType = BannerType.REGULAR;
  } else if (vendorType === VendorCategoryType.PRODUCT) {
    bannerType = BannerType.PRODUCT;
  }
  return bannerType;
}

export function getImageUpdateFields(
  fgImage?: any,
  bgImage?: any,
  imageUrls?: MultipleFileUploadInterface,
) {
  return {
    fgImageRef: fgImage ? imageUrls?.filePaths[0]?.imageUrl : undefined,
    fgImageRelativeUrl: fgImage
      ? imageUrls?.filePaths[0]?.relativePath
      : undefined,
    bgImageRef: bgImage
      ? imageUrls?.filePaths[1]?.imageUrl || imageUrls?.filePaths[0]?.imageUrl
      : undefined,
    bgImageRelativeUrl: bgImage
      ? imageUrls?.filePaths[1]?.relativePath ||
        imageUrls?.filePaths[0]?.relativePath
      : undefined,
  };
}

export function getUpdateFields(body: UpdateBannerDto) {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(body).filter(([_, value]) => value !== undefined),
  );
}

export function cleanupOldImages({
  banner,
  fgImage,
  bgImage,
  fileUploadService,
  deletedBannerItemImages,
}: {
  banner: Banner;
  fgImage?: unknown;
  bgImage?: unknown;
  fileUploadService: FileUploadService;
  deletedBannerItemImages: BannerItemImages[];
}) {
  if (fgImage || bgImage) {
    if (banner?.fgImageRelativeUrl)
      fileUploadService.handleSingleFileDeletion(banner.fgImageRelativeUrl);
    if (banner.bgImageRelativeUrl)
      fileUploadService.handleSingleFileDeletion(banner.bgImageRelativeUrl);
  }
  for (const image of deletedBannerItemImages)
    fileUploadService.handleSingleFileDeletion(image.relativeUrl);
}

export function rollbackImageUpload({
  imageUrls,
  bannerProductImage,
  fileUploadService,
}: {
  imageUrls?: MultipleFileUploadInterface;
  bannerProductImage?: MultipleFileUploadInterface;
  fileUploadService: FileUploadService;
}) {
  if (imageUrls)
    imageUrls.filePaths.forEach((image) =>
      fileUploadService.handleSingleFileDeletion(image.relativePath),
    );
  if (bannerProductImage)
    bannerProductImage.filePaths.forEach((image) =>
      fileUploadService.handleSingleFileDeletion(image.relativePath),
    );
}

export function checkFieldsForBanner({
  bannerType,
  body,
  vendorType,
}: {
  bannerType: BannerType;
  body: CreateBannerDto;
  vendorType: VendorType;
}) {
  if (bannerType === 'REGULAR') {
    if (!body.qty || !body.originalPricePerUnit || !body.productUnitId) {
      throw new BadRequestException(
        `Quantity(qty), Original Price Per Unit(originalPricePerUnit), and Quantity Unit are required when creating a banner for ${vendorType.name}.`,
      );
    }
  } else {
    if (body.qty || body.originalPricePerUnit || body.productUnitId) {
      throw new BadRequestException(
        `Quantity(qty), Original Price Per Unit(originalPricePerUnit), and Quantity Unit should not be provided for ${vendorType.name}.`,
      );
    }
  }
}
