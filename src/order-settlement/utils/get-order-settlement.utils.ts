import { Prisma } from '@prisma/client';
import { GetOrderSettlementQueryDto } from '../dto/get-order-settlement';
import { getDayRange } from 'src/common/functions/utils';

export function buildOrderSettlementWhereFilter({
  query,
}: {
  query: GetOrderSettlementQueryDto;
}) {
  const { vendorName, startDate, endDate, shopName, id, vendorId } = query;
  const where: Prisma.OrderSettlementWhereInput = {};

  if (vendorName || shopName) {
    where.vendor = {
      ...(vendorName && {
        User: {
          name: {
            contains: vendorName,
            mode: 'insensitive',
          },
        },
      }),
      ...(shopName && {
        shopInfo: {
          name: {
            contains: shopName,
            mode: 'insensitive',
          },
        },
      }),
    };
  }

  if (startDate && endDate) {
    where.date = {
      gte: getDayRange(new Date(startDate)).start,
      lte: getDayRange(new Date(endDate)).end,
    };
  } else if (startDate) {
    where.date = {
      gte: getDayRange(new Date(startDate)).start,
    };
  } else if (endDate) {
    where.date = {
      lte: getDayRange(new Date(endDate)).end,
    };
  }

  if (id) {
    where.id = id;
  }

  if (vendorId) {
    where.vendorId = vendorId;
  }

  return { where };
}
