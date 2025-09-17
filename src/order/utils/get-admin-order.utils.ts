import { Prisma } from '@prisma/client';
import { GetAdminOrderQueryDto } from '../dto/get-order-admin-query.dto';

export function buildAdminOrderWhereFilter({
  query,
}: {
  query: GetAdminOrderQueryDto;
}): Prisma.OrderWhereInput {
  const { vendorName, startDate, endDate, userName, shopName, orderId } = query;
  const where: Prisma.OrderWhereInput = {};

  if (vendorName) {
    where.orderItems = {
      some: {
        orderItemVendorServiceOption: {
          some: {
            vendorServiceOption: {
              vendor: {
                User: {
                  name: {
                    contains: vendorName,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  if (orderId) {
    where.orderId = {
      contains: orderId,
      mode: 'insensitive',
    };
  }

  if (shopName) {
    where.orderItems = {
      ...where.orderItems,
      some: {
        ...where.orderItems?.some,
        orderItemVendorServiceOption: {
          some: {
            vendorServiceOption: {
              vendor: {
                shopInfo: {
                  name: {
                    contains: shopName,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  if (userName) {
    where.orderedUser = {
      name: {
        contains: userName,
        mode: 'insensitive',
      },
    };
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.createdAt = {
      gte: new Date(startDate),
    };
  } else if (endDate) {
    where.createdAt = {
      lte: new Date(endDate),
    };
  }

  return where;
}
