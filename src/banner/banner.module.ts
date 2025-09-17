import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { ItemModule } from 'src/item/item.module';
import { KeywordModule } from 'src/keyword/keyword.module';

@Module({
  imports: [VendorModule, ItemModule, KeywordModule],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}
