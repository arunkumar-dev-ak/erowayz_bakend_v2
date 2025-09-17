import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from '../queue.service';

@Processor('expiryPayment')
@Injectable()
export class ExpiryPaymentProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  @Process('expiry-payment-job')
  async handleExpiryPayment() {
    const currentTime = new Date();
    const expiryThreshold = new Date(currentTime.getTime() + 10 * 60 * 1000); // 10 minutes from now
    const batchSize = 1000;
    let hasMore = true;
    let lastId: string | null = null;

    while (hasMore) {
      const payments: Payment[] = await this.prisma.payment.findMany({
        take: batchSize,
        orderBy: { id: 'asc' },
        ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
        where: {
          status: PaymentStatus.PENDING,
          paymentPageExpiry: {
            lt: expiryThreshold,
          },
        },
      });

      if (payments.length === 0) {
        hasMore = false;
        break;
      }

      await this.prisma.$transaction(
        payments.map((payment) =>
          this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          }),
        ),
      );

      lastId = payments[payments.length - 1]?.id ?? null;
    }
  }

  @OnQueueFailed({ name: 'expiry-payment-job' })
  async handleFailedJob(job: Job, error: Error) {
    console.error(`Job failed: ${job.id}`, error);
    await this.queueService.addToDeadLetterQueue(job.data);
  }
}
