import { Module } from '@nestjs/common';
import { ServiceOptionService } from './service-option.service';
import { ServiceOptionController } from './service-option.controller';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';

@Module({
  controllers: [ServiceOptionController],
  providers: [ServiceOptionService, VendorTypeService],
  exports: [ServiceOptionService, VendorTypeService],
})
export class ServiceOptionModule {}
