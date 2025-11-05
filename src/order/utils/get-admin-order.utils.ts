import { Prisma } from '@prisma/client';
import { GetAdminOrderQueryDto } from '../dto/get-order-admin-query.dto';
import { getDayRange } from 'src/common/functions/utils';

export function buildAdminOrderWhereFilter({
  query,
}: {
  query: GetAdminOrderQueryDto;
}): Prisma.OrderWhereInput {
  const {
    vendorName,
    startDate,
    endDate,
    userName,
    shopName,
    orderId,
    preferredPaymentMethod,
  } = query;
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

  if (preferredPaymentMethod) {
    where.preferredPaymentMethod = preferredPaymentMethod;
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: getDayRange(new Date(startDate)).start,
      lte: getDayRange(new Date(endDate)).end,
    };
  } else if (startDate) {
    where.createdAt = {
      gte: getDayRange(new Date(startDate)).start,
    };
  } else if (endDate) {
    where.createdAt = {
      lte: getDayRange(new Date(endDate)).end,
    };
  }

  return where;
}
