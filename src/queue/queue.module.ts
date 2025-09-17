import { forwardRef, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bull';
import { CancelOrderProcessor } from './consumers/cancel-order.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpiryPaymentProcessor } from './consumers/expiry-payment.processor';
import { ProcessPaymentProcessor } from './consumers/process-payment.processor';
import { WalletModule } from 'src/wallet/wallet.module';
import { VendorSubscriptionModule } from 'src/vendor-subscription/vendor-subscription.module';
import { OrderPaymentModule } from 'src/order-payment/order-payment.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'remainingQty',
      },
      {
        name: 'cancelOrder',
      },
      {
        name: 'deadLetter',
      },
      {
        name: 'expiryPayment',
      },
      {
        name: 'processPayment',
      },
    ),
    BullBoardModule.forFeature(
      {
        name: 'cancelOrder',
        adapter: BullAdapter,
      },
      {
        name: 'remainingQty',
        adapter: BullAdapter,
      },
      {
        name: 'deadLetter',
        adapter: BullAdapter,
      },
      {
        name: 'expiryPayment',
        adapter: BullAdapter,
      },
    ),
    WalletModule,
    VendorSubscriptionModule,
    OrderPaymentModule,
    forwardRef(() => PaymentModule),
  ],
  providers: [
    QueueService,
    CancelOrderProcessor,
    ExpiryPaymentProcessor,
    ProcessPaymentProcessor,
  ],
  exports: [
    BullModule,
    QueueService,
    CancelOrderProcessor,
    ExpiryPaymentProcessor,
    ProcessPaymentProcessor,
  ],
})
export class QueueModule {}
