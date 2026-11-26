import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { getItemWithAvgRating } from 'src/item/utils/get-item.utils';

export interface LastDeliveredOrderSummary {
  id: string;
  orderId: string;
  status: OrderStatus;
  createdAt: Date;
}

/*----- utils: fetch active vendor categories -----*/
export async function fetchActiveVendorCategories({
  vendorId,
  prisma,
}: {
  vendorId: string;
  prisma: PrismaService;
}) {
  return await prisma.category.findMany({
    where: {
      item: {
        some: {
          vendorId,
          status: 'ACTIVE',
        },
      },
    },
    select: {
      id: true,
      name: true,
      imageRef: true,
      relativeUrl: true,
      vendorTypeId: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

/*----- utils: build item include -----*/
export function buildStoreItemInclude(userId?: string): Prisma.ItemInclude {
  const include: Prisma.ItemInclude = {
    itemImage: {
      select: {
        id: true,
        absoluteUrl: true,
        relativeUrl: true,
      },
    },
    category: {
      select: {
        id: true,
        name: true,
      },
    },
    subCategory: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  if (userId) {
    include.cartItem = {
      where: {
        cart: {
          userId,
        },
      },
      select: {
        id: true,
        quantity: true,
        cartItemVendorServiceOption: {
          include: {
            vendorServiceOption: {
              include: {
                serviceOption: true,
              },
            },
          },
        },
        cart: {
          select: {
            id: true,
          },
        },
      },
    };
    include.orderItems = {
      where: {
        order: {
          userId,
        },
      },
      take: 1,
    };
  }

  return include;
}

/*----- utils: fetch paginated menu items with average rating -----*/
export async function fetchPaginatedStoreItems({
  vendorId,
  offset,
  limit,
  userId,
  prisma,
}: {
  vendorId: string;
  offset: number;
  limit: number;
  userId?: string;
  prisma: PrismaService;
}) {
  const itemInclude = buildStoreItemInclude(userId);

  const rawItems = await prisma.item.findMany({
    where: {
      vendorId,
      status: 'ACTIVE',
    },
    skip: offset,
    take: limit,
    include: itemInclude,
    orderBy: {
      productstatus: 'asc',
    },
  });

  return await getItemWithAvgRating({
    prisma,
    items: rawItems,
  });
}

/*----- utils: fetch total store items count -----*/
export async function fetchStoreItemsCount({
  vendorId,
  prisma,
}: {
  vendorId: string;
  prisma: PrismaService;
}): Promise<number> {
  return await prisma.item.count({
    where: {
      vendorId,
      status: 'ACTIVE',
    },
  });
}

/*----- utils: fetch customer's last completed/delivered order -----*/
export async function fetchLastDeliveredOrder({
  prisma,
  userId,
  vendorId,
}: {
  prisma: PrismaService;
  userId: string;
  vendorId: string;
}): Promise<LastDeliveredOrderSummary | null> {
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
