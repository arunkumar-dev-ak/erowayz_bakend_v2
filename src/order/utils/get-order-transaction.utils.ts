import { PaymentPurpose, Prisma } from '@prisma/client';
import { getDayRange } from 'src/common/functions/utils';
import { GetOrderTransactionQueryForAdminDto } from '../dto/get-order-transaction-query.dto';

export function buildOrderTransactiontWhereFilter({
  query,
}: {
  query: GetOrderTransactionQueryForAdminDto;
}) {
  const { shopName, vendorId, userId, userName, startDate, endDate } = query;

  const where: Prisma.PaymentWhereInput = {
    purpose: PaymentPurpose.PRODUCT_PURCHASE,
  };

  const conditions: Prisma.PaymentWhereInput[] = [];

  if (vendorId || shopName || userName || userId) {
    //for vendor
    conditions.push({
      orderPayment: {
        order: {
          orderItems: {
            some: {
              item: {
                ...(vendorId && { vendorId }),
                vendor: {
                  ...(userId && { userId }),
                  ...(userName && {
                    User: {
                      name: userName,
                    },
                  }),
                  ...(shopName && {
                    shopInfo: {
                      name: shopName,
                    },
                  }),
                },
              },
            },
          },
        },
      },
    });

    //for customer
    conditions.push({
      orderPayment: {
        order: {
          ...(userId && { userId }),
          ...(userName && {
            orderedUser: {
              name: userName,
            },
          }),
        },
      },
    });
  }

  if (conditions.length > 0) {
    where.OR = conditions;
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && {
        gte: getIstTimeRange(new Date(startDate)).startIst,
      }),
      ...(endDate && {
        lte: getIstTimeRange(new Date(endDate)).endIst,
      }),
    };
  }

  return { where };
}

export function getIstTimeRange(date: Date) {
  const { start, end } = getDayRange(date);

  // Shift to IST (UTC+5:30)
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins in ms
  const startIst = new Date(start.getTime() + IST_OFFSET_MS);
  const endIst = new Date(end.getTime() + IST_OFFSET_MS);

  return { startIst, endIst };
}
