import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ImageTypeEnum {
  SHOP = 'shop',
  LICENSE = 'license',
  PROFILE = 'profile',
  VENDOR = 'vendor',
  GENERAL = 'general',
  VENDORTYPE = 'vendortype',
  SERVICEOPTION = 'serviceOption',
  SERVICE = 'service',
  CATEGORY = 'category',
  SUBCATEGORY = 'subCategory',
  ITEM = 'item',
  BANNER = 'banner',
  BANNERPRODUCT = 'bannerProduct',
  BANNERVENDORITEM = 'bannerVendorItem',
  VENDORBANNER = 'vendorBanner',
  BANKPAYMENTTYPE = 'bankPaymentType',
  BANKNAME = 'bankName',
  DISCLAIMER = 'disclaimer',
  TERMSANDCONDITION = 'termsAndCondition',
  PRIVACYPOLICY = 'privacyPolicy',
  POSTER = 'poster',
  SETTLEMENT_IMAGE = 'settlementImage',
  COINS_SETTLEMENT_IMAGE = 'coinsSettlementImage',
}
export class FileUploadDto {
  @ApiProperty({
    description: 'Body type is required',
    required: true,
    enum: ImageTypeEnum,
  })
  @IsEnum(ImageTypeEnum, {
    message: 'type should be as SHOP, PROFILE, VENDOR or GENERAL',
  })
  type: ImageTypeEnum;
}
