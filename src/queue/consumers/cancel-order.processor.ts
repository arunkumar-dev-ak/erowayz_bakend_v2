import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from '../queue.service';

@Processor('cancelOrder')
@Injectable()
export class CancelOrderProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  @Process('cancel-expired-orders-job')
  async handleExpiredOrders() {
    const batchSize = 1000;
    let hasMore = true;
    let lastId: string | null = null;

    while (hasMore) {
      const expiredOrders: Order[] = await this.prisma.order.findMany({
        ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
        where: {
          orderStatus: 'PENDING',
          expiryAt: { lt: new Date() },
        },
        take: batchSize,
        orderBy: { id: 'asc' },
      });

      if (expiredOrders.length === 0) {
        hasMore = false;
        break;
      }

      const ids = expiredOrders.map((o) => o.id);

      await this.prisma.order.updateMany({
        where: { id: { in: ids } },
        data: {
          orderStatus: 'CANCELLED',
          declineType: 'SYSTEM',
        },
      });

      lastId = expiredOrders[expiredOrders.length - 1]?.id ?? null;
    }
  }

  @OnQueueFailed({ name: 'cancel-expired-orders-job' })
  async handleFailedJob(job: Job, error: Error) {
    console.error(`Job failed: ${job.id}`, error);
    await this.queueService.addToDeadLetterQueue(job.data);
  }
}
