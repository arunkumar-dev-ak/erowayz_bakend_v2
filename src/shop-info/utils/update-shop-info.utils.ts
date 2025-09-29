import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageFiedlsInterface } from 'src/vendor/utils/update-vendor.utils';
import { EditShopInfo } from '../dto/editshopinfo.dto';
import { License, Prisma, Status } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { LicenseCategoryService } from 'src/license-category/license-category.service';

export async function UpdateShopInfoUtils({
  body,
  shopImage,
  licenseImage,
  fileUploadService,
  licenseCategoryService,
  license,
}: {
  body: EditShopInfo;
  shopImage?: Express.Multer.File;
  licenseImage?: Express.Multer.File;
  fileUploadService: FileUploadService;
  licenseCategoryService: LicenseCategoryService;
  license?: License | null;
}) {
  const {
    shopName,
    address,
    istermsAccepted,
    shopCityId,
    pincode,
    latitude,
    longitude,
    licenseNo,
    expiryDate,
    licenseCategoryId,
    shopNameTamil,
    addressTamil,
    shopCategoryId,
  } = body;

  const shopInfoData: Prisma.ShopInfoUpdateInput = {
    ...(shopName && { name: shopName }),
    ...(address && { address }),
    ...(istermsAccepted && { istermsAccepted }),
    ...(shopCityId && { shopCityId }),
    ...(pincode && { pincode }),
    ...(latitude && { latitude }),
    ...(longitude && { longitude }),
    ...(shopNameTamil && { nameTamil: shopNameTamil }),
    ...(addressTamil && { addressTamil }),
    ...(shopCategoryId && { shopCategoryId }),
  };

  if (licenseCategoryId) {
    const licenseCategory =
      await licenseCategoryService.getLicenseCategoryById(licenseCategoryId);
    if (!licenseCategory || licenseCategory.status === Status.INACTIVE) {
      throw new BadRequestException('License Category Not found or inactive');
    }
  }

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
    licenseNo && expiryDate && licenseImageUrl && licenseCategoryId;
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
          licenseCategoryId,
          isLicenseApproved: false,
        },
        update: {
          ...(licenseNo && { licenseNo }),
          ...(expiryDate && { expiryDate }),
          ...(licenseCategoryId && { licenseCategoryId }),
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
        ...(licenseCategoryId && { licenseCategoryId }),
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
