import { forwardRef, Global, Module } from '@nestjs/common';
import { VendorSubscriptionService } from './vendor-subscription.service';
import { VendorSubscriptionController } from './vendor-subscription.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { ManualRefundModule } from 'src/manual-refund/manual-refund.module';
import { EasebuzzModule } from 'src/easebuzz/easebuzz.module';

@Global()
@Module({
  imports: [
    VendorModule,
    SubscriptionModule,
    ManualRefundModule,
    forwardRef(() => EasebuzzModule),
  ],
  controllers: [VendorSubscriptionController],
  providers: [VendorSubscriptionService],
  exports: [VendorSubscriptionService],
})
export class VendorSubscriptionModule {}
