import { Module } from '@nestjs/common';
import { VendorServiceOptionService } from './vendor-service-option.service';
import { VendorServiceOptionController } from './vendor-service-option.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { ServiceOptionModule } from 'src/service-option/service-option.module';

@Module({
  imports: [ServiceOptionModule, VendorModule],
  controllers: [VendorServiceOptionController],
  providers: [VendorServiceOptionService],
  exports: [VendorServiceOptionService, VendorModule, ServiceOptionModule],
})
export class VendorServiceOptionModule {}
