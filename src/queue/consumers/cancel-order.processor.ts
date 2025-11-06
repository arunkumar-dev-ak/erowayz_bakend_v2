import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from '../queue.service';
import { Prisma } from '@prisma/client';

type ExpiredOrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      select: {
        itemId: true;
        quantity: true;
        item: {
          select: {
            vendor: {
              select: {
                userId: true;
              };
            };
          };
        };
      };
    };
    orderedUser: {
      select: { id: true };
    };
  };
}>;

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
      const expiredOrders: ExpiredOrderWithRelations[] =
        await this.prisma.order.findMany({
          ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
          where: {
            orderStatus: 'PENDING',
            expiryAt: { lt: new Date() },
          },
          include: {
            orderItems: {
              select: {
                itemId: true,
                quantity: true,
                item: {
                  select: {
                    vendor: {
                      select: {
                        userId: true,
                      },
                    },
                  },
                },
              },
            },
            orderedUser: {
              select: { id: true },
            },
          },
          take: batchSize,
          orderBy: { id: 'asc' },
        });

      if (expiredOrders.length === 0) {
        hasMore = false;
        break;
      }

      for (const order of expiredOrders) {
        await this.prisma.$transaction(async (tx) => {
          // 1️⃣ Cancel order
          await tx.order.update({
            where: { id: order.id },
            data: {
              orderStatus: 'CANCELLED',
              declineType: 'SYSTEM',
            },
          });

          // 2️⃣ Revert item quantities
          await Promise.all(
            order.orderItems.map((orderItem) =>
              tx.item.update({
                where: { id: orderItem.itemId },
                data: {
                  remainingQty: { increment: orderItem.quantity },
                },
              }),
            ),
          );

          // 3️⃣ Unlock wallets if payment method is COINS
          if (order.preferredPaymentMethod === 'COINS') {
            // Get all unique vendor userIds from this order (in case multiple vendors somehow exist)
            const vendorUserId = order.orderItems[0]?.item.vendor.userId;

            const [customerWallet, vendorWallet] = await Promise.all([
              tx.wallet.findUnique({
                where: { userId: order.userId },
              }),
              vendorUserId
                ? tx.wallet.findUnique({
                    where: { userId: vendorUserId },
                  })
                : Promise.resolve(null),
            ]);

            // Unlock customer wallet
            if (customerWallet) {
              await tx.wallet.update({
                where: { id: customerWallet.id },
                data: { locked: false },
              });
            }

            // Decrement locked balance for the vendor’s wallet
            if (vendorWallet) {
              await tx.wallet.update({
                where: { id: vendorWallet.id },
                data: {
                  lockedBalance: {
                    decrement: Math.round(order.finalPayableAmount),
                  },
                },
              });
            }
          }
        });
      }

      lastId = expiredOrders[expiredOrders.length - 1]?.id ?? null;
    }
  }

  @OnQueueFailed({ name: 'cancel-expired-orders-job' })
  async handleFailedJob(job: Job, error: Error) {
    console.error(`Job failed: ${job.id}`, error);
    await this.queueService.addToDeadLetterQueue(job.data);
  }
}
