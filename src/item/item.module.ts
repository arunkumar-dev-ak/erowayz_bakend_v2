import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { SubCategoryService } from 'src/sub-category/sub-category.service';
import { CategoryModule } from 'src/category/category.module';
import { VendorModule } from 'src/vendor/vendor.module';

@Module({
  imports: [CategoryModule, VendorModule],
  controllers: [ItemController],
  providers: [ItemService, SubCategoryService],
  exports: [ItemService],
})
export class ItemModule {}
