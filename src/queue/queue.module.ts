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
import { VendorShopCloseProcessor } from './consumers/close-shop-processor';
import { CleanupProcessor } from './consumers/cleanup.processor';
import { EasebuzzModule } from 'src/easebuzz/easebuzz.module';

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
      {
        name: 'closeVendorShop', // add new queue
      },
      {
        name: 'cleanup', // NEW QUEUE
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
        name: 'processPayment',
        adapter: BullAdapter,
      },
      {
        name: 'expiryPayment',
        adapter: BullAdapter,
      },
      {
        name: 'closeVendorShop', // add new monitoring
        adapter: BullAdapter,
      },
      {
        name: 'cleanup',
        adapter: BullAdapter,
      },
    ),
    forwardRef(() => WalletModule),
    forwardRef(() => VendorSubscriptionModule),
    OrderPaymentModule,
    forwardRef(() => EasebuzzModule),
  ],
  providers: [
    QueueService,
    CancelOrderProcessor,
    ExpiryPaymentProcessor,
    ProcessPaymentProcessor,
    VendorShopCloseProcessor,
    CleanupProcessor,
  ],
  exports: [
    BullModule,
    QueueService,
    CancelOrderProcessor,
    ExpiryPaymentProcessor,
    ProcessPaymentProcessor,
    VendorShopCloseProcessor,
    CleanupProcessor,
  ],
})
export class QueueModule {}
