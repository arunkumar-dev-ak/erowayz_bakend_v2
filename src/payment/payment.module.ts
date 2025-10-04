import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { PaymentJuspayService } from './payment.juspay.service';
import { PaymentSerice } from './payment.service';
import { OrderPaymentModule } from 'src/order-payment/order-payment.module';
import { QueueModule } from 'src/queue/queue.module';
import { VendorSubscriptionModule } from 'src/vendor-subscription/vendor-subscription.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => QueueModule),
    OrderPaymentModule,
    VendorSubscriptionModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentJuspayService, PaymentSerice],
  exports: [ConfigModule, PaymentJuspayService, PaymentSerice],
})
export class PaymentModule {}
