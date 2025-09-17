import { Module } from '@nestjs/common';
import { VendorServiceService } from './vendor-service.service';
import { VendorServiceController } from './vendor-service.controller';
import { ServiceOptionModule } from 'src/service-option/service-option.module';
import { VendorModule } from 'src/vendor/vendor.module';

@Module({
  imports: [ServiceOptionModule, VendorModule],
  controllers: [VendorServiceController],
  providers: [VendorServiceService],
  exports: [ServiceOptionModule, VendorModule, VendorServiceService],
})
export class VendorServiceModule {}
