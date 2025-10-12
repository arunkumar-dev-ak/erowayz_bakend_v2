import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { UserService } from 'src/user/user.service';
import { KeywordModule } from 'src/keyword/keyword.module';
import { FcmTokenModule } from 'src/fcm-token/fcm-token.module';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { LicenseCategoryModule } from 'src/license-category/license-category.module';
import { CityModule } from 'src/city/city.module';
import { ShopCategoryModule } from 'src/shop-category/shop-category.module';
import { ReferralModule } from 'src/referral/referral.module';

@Module({
  imports: [
    KeywordModule,
    FcmTokenModule,
    RedisModule,
    LicenseCategoryModule,
    CityModule,
    ShopCategoryModule,
    ReferralModule,
  ],
  controllers: [VendorController],
  providers: [VendorService, VendorTypeService, UserService, ConfigService],
  exports: [VendorService, KeywordModule, VendorTypeService, CityModule],
})
export class VendorModule {}
