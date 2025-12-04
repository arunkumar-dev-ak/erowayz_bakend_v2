import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

type JobState = 'completed' | 'failed' | 'wait';

@Injectable()
export class CronjobsService {
  constructor(
    @InjectQueue('cancelOrder') private cancelQueue: Queue,
    @InjectQueue('remainingQty') private remainingQueue: Queue,
    @InjectQueue('expiryPayment') private expiryPayment: Queue,
    @InjectQueue('closeVendorShop') private closeVendorShopQueue: Queue,
    @InjectQueue('cleanup') private cleanupQueue: Queue,
    @InjectQueue('processPayment') private processPaymentQueue: Queue,
  ) {}

  private readonly completedAge = 2 * 24 * 60 * 60 * 1000; // 2 days
  private readonly failedAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly waitingAge = 10 * 24 * 60 * 60 * 1000; // 10 days
  private readonly batchSize = 1000; // batch size for cleanup

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

  @Cron('*/10 * * * *')
  async closeInactiveVendorShopsJob() {
    await this.closeVendorShopQueue.add(
      'close-inactive-vendor-shops-job',
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

  @Cron('0 3 * * *', { timeZone: 'Asia/Kolkata' }) // Daily at 2 AM IST
  async cleanupExpiredOtpAndTempRegister() {
    await this.cleanupQueue.add(
      'cleanup-expired-otp-temp-register-job',
      {},
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    );
  }

  @Cron('0 5 * * *', { timeZone: 'Asia/Kolkata' }) // 5 AM IST
  async cleanupAllQueues() {
    // Non-payment queues
    const nonPaymentQueues: Queue[] = [
      this.cancelQueue,
      this.remainingQueue,
      this.closeVendorShopQueue,
      this.cleanupQueue,
    ];

    for (const q of nonPaymentQueues) {
      await this.batchCleanQueue(q, 'completed', this.completedAge);
      await this.batchCleanQueue(q, 'failed', this.failedAge);
      await this.batchCleanQueue(q, 'wait', this.waitingAge); // waiting jobs older than 10 days
    }

    // Payment queues
    const paymentQueues: Queue[] = [
      this.expiryPayment,
      this.processPaymentQueue,
    ];

    for (const q of paymentQueues) {
      await this.batchCleanQueue(q, 'completed', this.completedAge);
      // Skip failed cleanup
      // Optionally clean waiting jobs older than 10 days
      await this.batchCleanQueue(q, 'wait', this.waitingAge);
    }
  }

  private async batchCleanQueue(queue: Queue, type: JobState, age: number) {
    let cleaned = 0;
    do {
      const job = await queue.clean(age, type, this.batchSize);
      cleaned = job.length;
    } while (cleaned === this.batchSize);
  }
}
