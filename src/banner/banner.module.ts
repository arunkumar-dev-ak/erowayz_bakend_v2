import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { ItemModule } from 'src/item/item.module';
import { KeywordModule } from 'src/keyword/keyword.module';
import { ProductUnitModule } from 'src/product-unit/product-unit.module';

@Module({
  imports: [VendorModule, ItemModule, KeywordModule, ProductUnitModule],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}
