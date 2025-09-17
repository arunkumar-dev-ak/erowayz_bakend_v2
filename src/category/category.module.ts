import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, VendorTypeService],
  exports: [CategoryService, VendorTypeService],
})
export class CategoryModule {}
