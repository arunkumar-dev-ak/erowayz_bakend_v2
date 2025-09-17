import { Module } from '@nestjs/common';
import { LicenseCategoryService } from './license-category.service';
import { LicenseCategoryController } from './license-category.controller';

@Module({
  controllers: [LicenseCategoryController],
  providers: [LicenseCategoryService],
})
export class LicenseCategoryModule {}
