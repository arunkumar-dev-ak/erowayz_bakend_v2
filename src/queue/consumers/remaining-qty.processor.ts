import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Item } from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from '../queue.service';

@Processor('remainingQty')
@Injectable()
export class RemainingQtyProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  @Process('reset-qty-job')
  async handleResetQty() {
    const batchSize = 1000;
    let hasMore = true;
    let lastId: string | null = null;

    while (hasMore) {
      const items: Item[] = await this.prisma.item.findMany({
        take: batchSize,
        orderBy: { id: 'asc' },
        ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
        where: {
          vendor: {
            User: {
              status: true,
            },
          },
        },
      });

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      await this.prisma.$transaction(
        items.map((item) =>
          this.prisma.item.update({
            where: { id: item.id },
            data: { remainingQty: item.dailyTotalQty },
          }),
        ),
      );

      lastId = items[items.length - 1]?.id ?? null;
    }
  }

  @OnQueueFailed({ name: 'reset-qty-job' })
  async handleFailedJob(job: Job, error: Error) {
    console.error(`Job failed: ${job.id}`, error);
    await this.queueService.addToDeadLetterQueue(job.data);
  }
}
