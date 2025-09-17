import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class CronjobsService {
  constructor(
    @InjectQueue('cancelOrder') private cancelQueue: Queue,
    @InjectQueue('remainingQty') private remainingQueue: Queue,
    @InjectQueue('expiryPayment') private expiryPayment: Queue,
  ) {}

  @Cron('*/1 * * * *') // every minute
  async handleExpiredOrders() {
    await this.cancelQueue.add(
      'cancel-expired-orders-job',
      {},
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );
  }

  @Cron('0 0 * * *', { timeZone: 'Asia/Kolkata' })
  async handleResetQty() {
    await this.remainingQueue.add(
      'reset-qty-job',
      {},
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    );
  }

  @Cron('0 0 * * *', { timeZone: 'Asia/Kolkata' })
  async triggerExpiryPaymentJob() {
    await this.expiryPayment.add(
      'expiry-payment-job',
      {},
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    );
  }
}
