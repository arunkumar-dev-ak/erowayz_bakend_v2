import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type ShopInfoVendor = {
  vendorId: string;
};

@Processor('closeVendorShop')
@Injectable()
export class VendorShopCloseProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('close-inactive-vendor-shops-job')
  async closeInactiveVendorShops() {
    const batchSize = 100;
    let lastId: string | null = null;
    let hasMore = true;

    while (hasMore) {
      // Tell TS what type to expect from findMany
      const vendors: ShopInfoVendor[] = await this.prisma.shopInfo.findMany({
        ...(lastId ? { cursor: { id: lastId }, skip: 1 } : {}),
        where: {
          isShopOpen: true,
        },
        select: {
          vendorId: true,
        },
        take: batchSize,
        orderBy: { id: 'asc' },
      });

      if (vendors.length === 0) {
        hasMore = false;
        break;
      }

      for (const vendor of vendors) {
        // vendor is now typed
        const hasActiveSubscription = await this.checkCurrentVendorSubscription(
          {
            vendorId: vendor.vendorId,
          },
        );

        if (!hasActiveSubscription) {
          await this.prisma.$transaction(async (tx) => {
            await tx.shopInfo.update({
              where: { vendorId: vendor.vendorId },
              data: { isShopOpen: false },
            });
          });
        }
      }

      lastId = vendors[vendors.length - 1]?.vendorId ?? null;
    }
  }

  // Move your existing subscription check logic here
  async checkCurrentVendorSubscription({
    vendorId,
  }: {
    vendorId: string;
  }): Promise<boolean> {
    const currentDate = new Date();
    const subscription = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId,
        isActive: true,
        startDate: { lte: currentDate },
        endDate: { gt: currentDate },
      },
    });
    return !!subscription;
  }
}
