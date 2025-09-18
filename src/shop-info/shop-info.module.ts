import { Module } from '@nestjs/common';
import { ShopInfoService } from './shop-info.service';
import { ShopInfoController } from './shop-info.controller';
import { LicenseCategoryModule } from 'src/license-category/license-category.module';
import { ShopCategoryModule } from 'src/shop-category/shop-category.module';
import { CityModule } from 'src/city/city.module';

@Module({
  imports: [LicenseCategoryModule, ShopCategoryModule, CityModule],
  controllers: [ShopInfoController],
  providers: [ShopInfoService],
  exports: [ShopInfoService],
})
export class ShopInfoModule {}
