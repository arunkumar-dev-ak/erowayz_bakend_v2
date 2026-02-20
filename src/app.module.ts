import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VendorTypeService } from './vendor-type/vendor-type.service';
import { VendorTypeModule } from './vendor-type/vendor-type.module';
import { ResponseModule } from './response/response.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceOptionModule } from './service-option/service-option.module';
import { TokenService } from './token/token.service';
import { TokenModule } from './token/token.module';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseModule } from './firebase/firebase.module';
import { VendorModule } from './vendor/vendor.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ShopInfoModule } from './shop-info/shop-info.module';
import { StaffModule } from './staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { CategoryModule } from './category/category.module';
import { VendorServiceOptionModule } from './vendor-service-option/vendor-service-option.module';
import { MetadataModule } from './metadata/metadata.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { ItemModule } from './item/item.module';
import { PredefinedBannerModule } from './predefined-banner/predefined-banner.module';
import { BannerModule } from './banner/banner.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { BullModuleOption } from './configs/bull-options-constants';
import { QueueModule } from './queue/queue.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullBoardOptions } from './configs/bullboard-options-constants';
import { OrderGatewayModule } from './order-gateway/order-gateway.module';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './configs/redis-options-constants';
import { ReviewModule } from './review/review.module';
import { BannerBookingModule } from './banner-booking/banner-booking.module';
import { ServiceBookingModule } from './service-booking/service-booking.module';
import { KeywordModule } from './keyword/keyword.module';
import { BloodDetailsModule } from './blood-details/blood-details.module';
import { DynamicFieldModule } from './dynamic-field/dynamic-field.module';
import { BannerVendorItemModule } from './banner-vendor-item/banner-vendor-item.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { BankDetailModule } from './bank-detail/bank-detail.module';
import { VendorSubscriptionModule } from './vendor-subscription/vendor-subscription.module';
import { ManualRefundModule } from './manual-refund/manual-refund.module';
import { ShopTimingModule } from './shop-timing/shop-timing.module';
import { FavouriteModule } from './favourite/favourite.module';
import { VendorServiceModule } from './vendor-service/vendor-service.module';
import { FcmTokenModule } from './fcm-token/fcm-token.module';
import { HomeApiModule } from './home-api/home-api.module';
import { WalletModule } from './wallet/wallet.module';
import { ErrorLogService } from './error-log/error-log.service';
import { ErrorLogModule } from './error-log/error-log.module';
import { OrderPaymentModule } from './order-payment/order-payment.module';
import { LicenseCategoryModule } from './license-category/license-category.module';
import { ProductUnitModule } from './product-unit/product-unit.module';
import { BankNameModule } from './bank-name/bank-name.module';
import { CityModule } from './city/city.module';
import { ShopCategoryModule } from './shop-category/shop-category.module';
import { BankPaymenttypeModule } from './bank-paymenttype/bank-paymenttype.module';
import { DisclaimerModule } from './disclaimer/disclaimer.module';
import { TermsAndConditionModule } from './terms-and-condition/terms-and-condition.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { VideoLinkModule } from './video-link/video-link.module';
import { SettlementModule } from './settlement/settlement.module';
import { ReferralModule } from './referral/referral.module';
import { PosterModule } from './poster/poster.module';
import { OrderSettlementModule } from './order-settlement/order-settlement.module';
import { CoinsSettlementModule } from './coins-settlement/coins-settlement.module';
import { SubAdminModule } from './sub-admin/sub-admin.module';
import { PlatformFeeModule } from './platform-fee/platform-fee.module';
import { UserReportModule } from './user-report/user-report.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CoinImageModule } from './coin-image/coin-image.module';
import { EasebuzzModule } from './easebuzz/easebuzz.module';

@Module({
  imports: [
    BullModule.forRootAsync(BullModuleOption),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ cache: true }),
    BullBoardModule.forRootAsync(BullBoardOptions),
    CacheModule.registerAsync(RedisOptions),
    VendorTypeModule,
    ResponseModule,
    PrismaModule,
    ServiceOptionModule,
    TokenModule,
    AuthModule,
    FirebaseModule,
    VendorModule,
    UserModule,
    FileUploadModule,
    ShopInfoModule,
    StaffModule,
    AdminModule,
    CategoryModule,
    VendorServiceOptionModule,
    MetadataModule,
    SubCategoryModule,
    ItemModule,
    PredefinedBannerModule,
    BannerModule,
    CartModule,
    OrderModule,
    CronjobsModule,
    ConfigModule,
    QueueModule,
    OrderGatewayModule,
    RedisModule,
    ReviewModule,
    BannerBookingModule,
    ServiceBookingModule,
    KeywordModule,
    BloodDetailsModule,
    DynamicFieldModule,
    BannerVendorItemModule,
    SubscriptionModule,
    BankDetailModule,
    VendorSubscriptionModule,
    ManualRefundModule,
    ServeStaticModule.forRoot({
      rootPath: join(`${process.env.FILE_UPLOAD_PATH}`),
      serveRoot: '/client/',
    }),
    ShopTimingModule,
    FavouriteModule,
    VendorServiceModule,
    FcmTokenModule,
    HomeApiModule,
    WalletModule,
    ErrorLogModule,
    OrderPaymentModule,
    LicenseCategoryModule,
    ProductUnitModule,
    BankNameModule,
    CityModule,
    ShopCategoryModule,
    BankPaymenttypeModule,
    DisclaimerModule,
    TermsAndConditionModule,
    PrivacyPolicyModule,
    VideoLinkModule,
    SettlementModule,
    ReferralModule,
    PosterModule,
    OrderSettlementModule,
    CoinsSettlementModule,
    SubAdminModule,
    PlatformFeeModule,
    UserReportModule,
    DashboardModule,
    CoinImageModule,
    EasebuzzModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    VendorTypeService,
    TokenService,
    JwtService,
    FirebaseService,
    ErrorLogService,
  ],
})
export class AppModule {}
