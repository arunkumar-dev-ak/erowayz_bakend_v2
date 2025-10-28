import { BannerService } from '../banner.service';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  Banner,
  BannerItemImages,
  BannerType,
  KeyWordType,
  OfferType,
  Prisma,
  VendorType,
} from '@prisma/client';
import { createBannerItemImages } from './create-banner.utils';
import { MultipleFileUploadInterface } from 'src/vendor/vendor.service';
import { KeywordService } from 'src/keyword/keyword.service';

export const UpdateBannerValidation = async ({
  bannerService,
  body,
  vendorId,
  bannerId,
  keywordService,
}: {
  bannerService: BannerService;
  body: UpdateBannerDto;
  keywordService: KeywordService;
  vendorId: string;
  bannerId: string;
}) => {
  const { deletedItemImageIds } = body;
  //check banner is associated with vendor
  const banner = await bannerService.checkBannerByVendor({
    vendorId,
    bannerId,
  });
  if (!banner) {
    throw new BadRequestException(
      'Banner not found or not associated with Vendor',
    );
  }

  //check unique name if name is provided
  if (body.name) {
    const bannerByName = await bannerService.checkBannerByName({
      name: body.name,
      vendorId,
    });
    if (bannerByName && bannerByName.id !== bannerId) {
      throw new BadRequestException('Banner name must be unique');
    }
  }

  //checking amount
  checkOfferVal({
    body,
    banner,
  });

  //checking time
  if (
    (body.startDateTime && !body.endDateTime) ||
    (!body.startDateTime && body.endDateTime)
  ) {
    checkTime({
      bannerStartTime: banner.startDateTime,
      bannerEndTime: banner.endDateTime,
      bodyStartTime: body.startDateTime,
      bodyEndTime: body.endDateTime,
    });
  }

  //check banner fields
  checkBannerFieldsForUpdate({
    bannerType: banner.bannerType,
    body,
    vendorType: banner.vendor.vendorType,
  });

  let deletedBannerItemImages: BannerItemImages[] = [];

  //checking images
  if (deletedItemImageIds && deletedItemImageIds.length > 0) {
    const deletedImages =
      await bannerService.findBannerItemImages(deletedItemImageIds);
    if (deletedImages.length !== deletedItemImageIds.length) {
      throw new BadRequestException(
        'Some of the deleted item Images are invalid',
      );
    }
    deletedBannerItemImages = deletedImages;
  }

  //checking keyWords
  if (body.keyWordIds) {
    const keywordsCount = await keywordService.checkKeyWordCountForRegistration(
      body.keyWordIds,
      banner.vendor.vendorTypeId,
      KeyWordType.BANNER,
    );
    if (keywordsCount !== body.keyWordIds.length) {
      throw new BadRequestException(
        `Aplogies for the reason,Some of the Keywords is not associated with ${banner.vendor.vendorType.name}`,
      );
    }
  }

  return { banner, deletedBannerItemImages };
};

export function checkTime({
  bannerStartTime,
  bannerEndTime,
  bodyStartTime,
  bodyEndTime,
}: {
  bannerStartTime: Date;
  bannerEndTime: Date;
  bodyStartTime?: Date;
  bodyEndTime?: Date;
}) {
  const currentDateTime = new Date();
  const isOfferActive = bannerStartTime <= currentDateTime;

  if (isOfferActive) {
    if (bodyStartTime || bodyEndTime) {
      throw new ConflictException(
        'You cannot change the start or end time because the offer is already active or has ended.',
      );
    }
  }

  if (bodyStartTime && bodyStartTime >= bannerEndTime) {
    throw new ConflictException(
      'The start time must be earlier than the end time.',
    );
  }

  if (bodyEndTime && bodyEndTime <= bannerStartTime) {
    throw new ConflictException(
      'The end time must be later than the start time.',
    );
  }
}

export function checkOfferVal({
  body,
  banner,
}: {
  body: UpdateBannerDto;
  banner: Banner;
}) {
  if (body.offerType || body.minApplyValue || body.offerValue) {
    const offerType = body.offerType || banner.offerType;
    const offerValue = body.offerValue || banner.offerValue;
    const minApplyValue = body.minApplyValue || banner.minApplyValue;

    if (offerType === OfferType.FLAT && offerValue >= minApplyValue) {
      throw new BadRequestException(
        'Offer value should be less than Minimum Purchase Value if OfferType is FLAT.',
      );
    }

    if (offerType === OfferType.PERCENTAGE && offerValue >= 100) {
      throw new BadRequestException(
        'Offer value should be less than 100 if OfferType is PERCENTAGE.',
      );
    }
  }
}

export function checkBannerFieldsForUpdate({
  bannerType,
  body,
  vendorType,
}: {
  bannerType: BannerType;
  body: UpdateBannerDto;
  vendorType: VendorType;
}) {
  if (bannerType === 'PRODUCT') {
    if (body.qty || body.originalPricePerUnit || body.qtyUnit) {
      throw new BadRequestException(
        `Quantity(qty), Original Price Per Unit(originalPricePerUnit), and Quantity Unit(qtyUnit) should not be provided for ${vendorType.name}.`,
      );
    }
  }
}

export const buildUpdateBannerData = ({
  body,
  bgImageRef,
  bgImageRelativeUrl,
  fgImageRef,
  fgImageRelativeUrl,
  bannerProductImage,
}: {
  body: UpdateBannerDto;
  bgImageRef?: string | undefined;
  bgImageRelativeUrl?: string | undefined;
  fgImageRef?: string | undefined;
  fgImageRelativeUrl?: string | undefined;
  bannerProductImage: MultipleFileUploadInterface | undefined;
}): Prisma.BannerUpdateInput => {
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
    qtyUnit,
    keyWordIds,
    title,
    subHeading,
    subTitle,
  } = body;

  const updateData: Prisma.BannerUpdateInput = {
    ...(name && { name }),
    ...(startDateTime && { startDateTime }),
    ...(endDateTime && { endDateTime }),
    ...(offerType && { offerType }),
    ...(offerValue && { offerValue }),
    ...(minApplyValue && { minApplyValue }),
    ...(status && { status }),
    ...(description && { description }),
    ...(title && { title }),
    ...(subHeading && { subHeading }),
    ...(textColor && { textColor }),
    ...(bgColor && { bgColor }),
    ...(bgImageRef && { bgImageRef }),
    ...(bgImageRelativeUrl && { bgImageRelativeUrl }),
    ...(fgImageRef && { fgImageRef }),
    ...(fgImageRelativeUrl && { fgImageRelativeUrl }),
    ...(fgImagePosition && { fgImagePosition }),
    ...(originalPricePerUnit && { originalPricePerUnit }),
    ...(qty && { qty }),
    ...(qtyUnit && { qtyUnit }),
    ...(subHeading && { subTitle }),
    bannerItemImages: bannerProductImage
      ? createBannerItemImages(bannerProductImage)
      : {},
    ...(keyWordIds?.length
      ? {
          keyWordBanner: {
            createMany: {
              data: keyWordIds.map((keywordId) => ({
                keywordId,
              })),
            },
          },
        }
      : {}),
  };

  return updateData;
};
