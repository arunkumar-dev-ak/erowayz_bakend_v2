import { Module } from '@nestjs/common';
import { BannerVendorItemService } from './banner-vendor-item.service';
import { BannerVendorItemController } from './banner-vendor-item.controller';

@Module({
  controllers: [BannerVendorItemController],
  providers: [BannerVendorItemService],
})
export class BannerVendorItemModule {}
