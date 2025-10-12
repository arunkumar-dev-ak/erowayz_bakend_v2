import { forwardRef, Global, Module } from '@nestjs/common';
import { VendorSubscriptionService } from './vendor-subscription.service';
import { VendorSubscriptionController } from './vendor-subscription.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ManualRefundModule } from 'src/manual-refund/manual-refund.module';

@Global()
@Module({
  imports: [
    VendorModule,
    SubscriptionModule,
    forwardRef(() => PaymentModule),
    ManualRefundModule,
  ],
  controllers: [VendorSubscriptionController],
  providers: [VendorSubscriptionService],
  exports: [VendorSubscriptionService],
})
export class VendorSubscriptionModule {}
