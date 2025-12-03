import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('cancelOrder') private cancelOrderQueue: Queue,
    @InjectQueue('remainingQty') private remainingQtyQueue: Queue,
    @InjectQueue('deadLetter') private deadLetterQueue: Queue,
    @InjectQueue('expiryPayment') private expiryPaymentQueue: Queue,
    @InjectQueue('processPayment') private processPaymentQueue: Queue,
    @InjectQueue('closeVendorShop') private closeVendorShopQueue: Queue,
    @InjectQueue('cleanup') private cleanupQueue: Queue,
  ) {}

  async addCancelOrderJob(orderId: string) {
    await this.cancelOrderQueue.add(
      'cancel-order-job',
      { orderId },
      {
        removeOnComplete: {
          age: 129600000,
        },
        removeOnFail: {
          age: 129600000,
        },
      },
    );
  }

  async addRemainingQtyJob(itemIds: string[]) {
    await this.remainingQtyQueue.add(
      'reset-qty-job',
      { itemIds },
      {
        removeOnComplete: {
          age: 129600000,
        },
        removeOnFail: {
          age: 129600000,
        },
      },
    );
  }

  async addCloseVendorShopJob() {
    await this.closeVendorShopQueue.add(
      'close-inactive-vendor-shops-job',
      {},
      {
        removeOnComplete: { age: 129600000 }, // 1.5 days
        removeOnFail: { age: 129600000 },
      },
    );
  }

  async cancelPaymentJob(paymentIds: string[]) {
    await this.expiryPaymentQueue.add(
      'expiry-payment-job',
      { paymentIds },
      {
        removeOnComplete: {
          age: 129600000,
        },
        removeOnFail: {
          age: 129600000,
        },
      },
    );
  }

  async processPaymentJob(paymentId: string) {
    await this.processPaymentQueue.add(
      'process-payment-job',
      { paymentId },
      {
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    );
  }

  async addToDeadLetterQueue(data: any) {
    await this.deadLetterQueue.add('dead-letter-job', data, {
      removeOnComplete: {
        age: 129600000,
      },
      removeOnFail: {
        age: 129600000,
      },
    });
  }

  async addCleanupJob() {
    await this.cleanupQueue.add(
      'cleanup-expired-otp-temp-register-job',
      {},
      {
        removeOnComplete: { age: 129600000 }, // 1.5 days
        removeOnFail: { age: 129600000 },
      },
    );
  }
}
