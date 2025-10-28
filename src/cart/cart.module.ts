import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ItemModule } from 'src/item/item.module';
import { BannerModule } from 'src/banner/banner.module';
import { VendorServiceOptionModule } from 'src/vendor-service-option/vendor-service-option.module';
import { PlatformFeeModule } from 'src/platform-fee/platform-fee.module';

@Module({
  imports: [
    ItemModule,
    BannerModule,
    VendorServiceOptionModule,
    PlatformFeeModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
