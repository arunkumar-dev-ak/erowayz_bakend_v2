import { Module } from '@nestjs/common';
import { ShopCategoryService } from './shop-category.service';
import { ShopCategoryController } from './shop-category.controller';
import { VendorTypeModule } from 'src/vendor-type/vendor-type.module';

@Module({
  imports: [VendorTypeModule],
  controllers: [ShopCategoryController],
  providers: [ShopCategoryService],
})
export class ShopCategoryModule {}
