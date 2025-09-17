import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { VendorTypeModule } from 'src/vendor-type/vendor-type.module';
import { ServiceOptionModule } from 'src/service-option/service-option.module';

@Module({
  imports: [VendorTypeModule, ServiceOptionModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService, VendorTypeModule, ServiceOptionModule],
})
export class SubscriptionModule {}
