import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface MyLastOrderResult {
  id: string;
  orderId: string;
  status: OrderStatus;
  createdAt: Date;
}

/*----- utils: fetch customer's last completed/delivered product order for vendor -----*/
export async function fetchMyLastDeliveredOrder({
  prisma,
  userId,
  vendorId,
}: {
  prisma: PrismaService;
  userId: string;
  vendorId: string;
}): Promise<MyLastOrderResult | null> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      orderStatus: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      orderItems: {
        some: {
          OR: [
            { item: { vendorId } },
            {
              orderItemVendorServiceOption: {
                some: {
                  vendorServiceOption: { vendorId },
                },
              },
            },
          ],
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderId: true,
      orderStatus: true,
      createdAt: true,
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderId: order.orderId,
    status: order.orderStatus,
    createdAt: order.createdAt,
  };
}
