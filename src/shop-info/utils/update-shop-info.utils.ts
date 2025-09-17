import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageFiedlsInterface } from 'src/vendor/utils/update-vendor.utils';
import { EditShopInfo } from '../dto/editshopinfo.dto';
import { License, Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export function UpdateShopInfoUtils({
  body,
  shopImage,
  licenseImage,
  fileUploadService,
  license,
}: {
  body: EditShopInfo;
  shopImage?: Express.Multer.File;
  licenseImage?: Express.Multer.File;
  fileUploadService: FileUploadService;
  license?: License | null;
}) {
  const {
    shopName,
    address,
    istermsAccepted,
    city,
    pincode,
    latitude,
    longitude,
    licenseNo,
    expiryDate,
    licenseType,
    shopNameTamil,
    addressTamil,
    shopType,
  } = body;

  const shopInfoData: Prisma.ShopInfoUpdateInput = {
    ...(shopName && { name: shopName }),
    ...(address && { address }),
    ...(istermsAccepted && { istermsAccepted }),
    ...(city && { city }),
    ...(pincode && { pincode }),
    ...(latitude && { latitude }),
    ...(longitude && { longitude }),
    ...(shopNameTamil && { nameTamil: shopNameTamil }),
    ...(addressTamil && { addressTamil }),
    ...(shopType && { shopType }),
  };

  /*----- Uploading images -----*/
  const filesToUpload: Express.Multer.File[] = [];
  const pathTypes: ImageTypeEnum[] = [];

  const imageMap: Partial<Record<ImageTypeEnum, number>> = {};

  if (shopImage) {
    imageMap[ImageTypeEnum.SHOP] = filesToUpload.length;
    filesToUpload.push(shopImage);
    pathTypes.push(ImageTypeEnum.SHOP);
  }

  if (licenseImage) {
    imageMap[ImageTypeEnum.LICENSE] = filesToUpload.length;
    filesToUpload.push(licenseImage);
    pathTypes.push(ImageTypeEnum.LICENSE);
  }

  let uploadedImageUrls: { filePaths: ImageFiedlsInterface[] } = {
    filePaths: [],
  };

  if (filesToUpload.length) {
    uploadedImageUrls =
      fileUploadService.handleMultipleFileUploadWithDifferentPath({
        files: filesToUpload,
        pathType: pathTypes,
      });
  }

  const shopImageUrl =
    imageMap[ImageTypeEnum.SHOP] !== undefined
      ? uploadedImageUrls.filePaths[imageMap[ImageTypeEnum.SHOP]]
      : null;
  if (shopImageUrl) {
    shopInfoData.relativeUrl = shopImageUrl.relativePath;
    shopInfoData.shopImageRef = shopImageUrl.imageUrl;
  }

  const licenseImageUrl =
    imageMap[ImageTypeEnum.LICENSE] !== undefined
      ? uploadedImageUrls.filePaths[imageMap[ImageTypeEnum.LICENSE]]
      : null;

  // Handle license update conditionally
  let licenseUpdate:
    | Prisma.LicenseUpdateOneWithoutShopInfoNestedInput
    | undefined = undefined;

  const shouldCreate =
    licenseNo && expiryDate && licenseImageUrl && licenseType;
  const shouldUpdate = licenseNo || expiryDate || licenseImageUrl;

  if (shouldUpdate && (!license || license === null)) {
    throw new BadRequestException(
      'License Not found,So you must provide licenseNo,expiryDate , licenseImageUrl , licenseType',
    );
  }

  if (shouldCreate) {
    licenseUpdate = {
      upsert: {
        create: {
          licenseNo,
          expiryDate,
          image: licenseImageUrl.imageUrl,
          relativeUrl: licenseImageUrl.relativePath,
          licenseType,
          isLicenseApproved: false,
        },
        update: {
          ...(licenseNo && { licenseNo }),
          ...(expiryDate && { expiryDate }),
          ...(licenseType && { licenseType }),
          ...(licenseImageUrl && {
            image: licenseImageUrl.imageUrl,
            relativeUrl: licenseImageUrl.relativePath,
          }),
          isLicenseApproved: false,
        },
      },
    };
  } else if (shouldUpdate) {
    licenseUpdate = {
      update: {
        ...(licenseNo && { licenseNo }),
        ...(expiryDate && { expiryDate }),
        ...(licenseImageUrl && {
          image: licenseImageUrl.imageUrl,
          relativeUrl: licenseImageUrl.relativePath,
        }),
        isLicenseApproved: false,
      },
    };
  }

  return { shopInfoData, licenseUpdate, shopImageUrl, licenseImageUrl };
}
