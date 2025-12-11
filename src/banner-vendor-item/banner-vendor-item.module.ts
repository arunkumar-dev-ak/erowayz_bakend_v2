import { Module } from '@nestjs/common';
import { BannerVendorItemService } from './banner-vendor-item.service';
import { BannerVendorItemController } from './banner-vendor-item.controller';
import { ProductUnitModule } from 'src/product-unit/product-unit.module';

@Module({
  imports: [ProductUnitModule],
  controllers: [BannerVendorItemController],
  providers: [BannerVendorItemService],
})
export class BannerVendorItemModule {}
