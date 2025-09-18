import { Item, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const includeItem = (userId?: string) => {
  const include: Prisma.ItemInclude = {
    vendor: {
      select: {
        id: true,
        paymentMethod: true,
        shopInfo: {
          include: {
            shopCategory: true,
            shopCity: true,
          },
        },
        vendorServiceOption: {
          include: {
            serviceOption: true,
          },
        },
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
    itemImage: {
      select: {
        id: true,
        absoluteUrl: true,
        relativeUrl: true,
      },
    },
  };

  if (userId) {
    include.cartItem = {
      where: {
        cart: {
          userId: userId,
        },
      },
      select: {
        id: true,
        cartItemVendorServiceOption: {
          include: {
            vendorServiceOption: {
              include: {
                serviceOption: true,
              },
            },
          },
        },
        quantity: true,
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
};

export async function getItemWithAvgRating({
  prisma,
  items,
}: {
  prisma: PrismaService;
  items: Item[];
}) {
  const itemIds = items.map((i) => i.id);

  const avgRatings = await prisma.$queryRaw<
    Array<{ itemId: string; avg_rating: number }>
  >`
  SELECT
    oi."itemId",
    AVG(r.rating::numeric) as avg_rating
  FROM "Review" r
  INNER JOIN "OrderItem" oi ON r."orderItemId" = oi.id
  WHERE oi."itemId" = ANY(${itemIds})
    AND r.rating IS NOT NULL
  GROUP BY oi."itemId"
`;

  const itemsRatingsMap: Record<string, number | null> = Object.fromEntries(
    avgRatings.map((r) => [r.itemId, Number(r.avg_rating)]),
  );

  const itemsWithRating = items.map((item) => ({
    ...item,
    avgRating: itemsRatingsMap[item.id] ?? null,
  }));

  return itemsWithRating;
}
