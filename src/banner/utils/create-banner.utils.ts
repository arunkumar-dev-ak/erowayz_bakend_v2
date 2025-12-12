import {
  MultipleFileUploadInterface,
  VendorService,
} from 'src/vendor/vendor.service';
import { BannerService } from '../banner.service';
import { checkFieldsForBanner, getBannerType } from './bannerhelper';
import { BadRequestException } from '@nestjs/common';
import { CreateBannerDto } from '../dto/create-banner.dto';
import {
  BannerType,
  KeyWordType,
  Prisma,
  VendorSubscription,
} from '@prisma/client';
import { KeywordService } from 'src/keyword/keyword.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
import { ProductUnitService } from 'src/product-unit/product-unit.service';

export const CreateBannerValidation = async ({
  bannerService,
  vendorService,
  keywordService,
  body,
  vendorId,
  vendorSubscriptionService,
  currentVendorSubscription,
  productUnitService,
}: {
  bannerService: BannerService;
  vendorService: VendorService;
  keywordService: KeywordService;
  body: CreateBannerDto;
  vendorId: string;
  vendorSubscriptionService: VendorSubscriptionService;
  currentVendorSubscription: VendorSubscription;
  productUnitService: ProductUnitService;
}) => {
  let updateVendorUsageQuery: Prisma.VendorFeatureUsageUpdateArgs | null = null;

  const vendorFeatureUsageForQtyUpdate =
    await vendorSubscriptionService.getOrCreateFeatureUsage({
      vendorSubscriptionId: currentVendorSubscription.id,
      feature: 'bannerCount',
    });
  const bannerLimit = (
    vendorFeatureUsageForQtyUpdate.vendorSubscription.planFeatures as Record<
      string,
      any
    >
  )['bannerCount'] as number | null;
  if (!bannerLimit) {
    throw new BadRequestException('You are not allowed to access this feature');
  }
  if (vendorFeatureUsageForQtyUpdate.usageCount >= bannerLimit) {
    throw new BadRequestException(
      'You have reached the limit to create the banner',
    );
  }

  if (body.productUnitId) {
    const productUnit = await productUnitService.getProductUnitById(
      body.productUnitId,
    );
    if (!productUnit || productUnit.status == 'INACTIVE') {
      throw new BadRequestException('Product Unit is inavlid');
    }
  }

  updateVendorUsageQuery = {
    where: {
      id: vendorFeatureUsageForQtyUpdate.id,
    },
    data: {
      usageCount: {
        increment: 1,
      },
    },
  };

  //unique name
  if (await bannerService.checkBannerByName({ vendorId, name: body.name })) {
    throw new BadRequestException('Banner name must be unique');
  }

  //get vendor
  const vendor = await vendorService.findVendorById({ id: vendorId });
  if (!vendor) {
    throw new BadRequestException('Invalid vendorId');
  }

  //check vendorType and set banner type
  const bannerType = getBannerType(vendor.vendorType.type);
  if (!bannerType)
    throw new BadRequestException(
      'Invalid vendor type, Vendor Type should be in Product or Banner type',
    );

  //check banner fields
  checkFieldsForBanner({ bannerType, body, vendorType: vendor.vendorType });

  //check keyword ids
  const keywordsCount = await keywordService.checkKeyWordCountForRegistration(
    body.keyWordIds,
    vendor.vendorTypeId,
    KeyWordType.BANNER,
  );
  if (keywordsCount !== body.keyWordIds.length) {
    throw new BadRequestException(
      `Aplogies for the reason,Some of the Keywords is not associated with ${vendor.vendorType.name}`,
    );
  }

  return { bannerType, updateVendorUsageQuery };
};

export function createBannerItemImages(
  bannerProductImage: MultipleFileUploadInterface,
) {
  return {
    create: bannerProductImage.filePaths.map((file) => ({
      imageRef: file.imageUrl,
      relativeUrl: file.relativePath,
    })),
  };
}

export const buildCreateBannerData = ({
  vendorId,
  bannerType,
  body,
  bgImageRef,
  bgImageRelativeUrl,
  fgImageRef,
  fgImageRelativeUrl,
  bannerProductImage,
}: {
  vendorId: string;
  bannerType: BannerType;
  body: CreateBannerDto;
  bgImageRef?: string | undefined;
  bgImageRelativeUrl?: string | undefined;
  fgImageRef?: string | undefined;
  fgImageRelativeUrl?: string | undefined;
  bannerProductImage: MultipleFileUploadInterface | undefined;
}): Prisma.BannerCreateInput => {
  const {
    name,
    description,
    textColor,
    startDateTime,
    endDateTime,
    bgColor,
    fgImagePosition,
    minApplyValue,
    offerType,
    offerValue,
    status,
    originalPricePerUnit,
    qty,
    productUnitId,
    keyWordIds,
    title,
    subHeading,
    subTitle,
    nameTamil,
    titleTamil,
    subHeadingTamil,
    subTitleTamil,
    descriptionTamil,
  } = body;

  const createData: Prisma.BannerCreateInput = {
    name,
    vendor: { connect: { id: vendorId } },
    bannerType,
    startDateTime,
    endDateTime,
    offerType,
    offerValue,
    minApplyValue,
    status: status ?? 'ACTIVE',
    nameTamil,
    titleTamil,
    subHeadingTamil,
    subTitleTamil,
    descriptionTamil,
    productUnit: {
      connect: {
        id: productUnitId,
      },
    },
    ...(title && { title }),
    ...(subHeading && { subHeading }),
    ...(description && { description }),
    ...(textColor && { textColor }),
    ...(bgColor && { bgColor }),
    ...(bgImageRef && { bgImageRef }),
    ...(bgImageRelativeUrl && { bgImageRelativeUrl }),
    ...(fgImageRef && { fgImageRef }),
    ...(fgImageRelativeUrl && { fgImageRelativeUrl }),
    ...(fgImagePosition && { fgImagePosition }),
    ...(originalPricePerUnit && { originalPricePerUnit }),
    ...(qty && { qty }),
    ...(subTitle && { subTitle }),
    bannerItemImages: bannerProductImage
      ? createBannerItemImages(bannerProductImage)
      : {},
    keyWordBanner: {
      createMany: {
        data: keyWordIds.map((keywordId) => ({
          keywordId,
        })),
      },
    },
  };

  return createData;
};
