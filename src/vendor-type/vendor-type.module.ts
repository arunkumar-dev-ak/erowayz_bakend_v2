import { Module } from '@nestjs/common';
import { VendorTypeController } from './vendor-type.controller';
import { VendorTypeService } from './vendor-type.service';

@Module({
  providers: [VendorTypeService],
  controllers: [VendorTypeController],
  exports: [VendorTypeService],
})
export class VendorTypeModule {}
