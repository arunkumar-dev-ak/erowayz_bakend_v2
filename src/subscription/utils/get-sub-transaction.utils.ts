import { PaymentPurpose, Prisma } from '@prisma/client';
import { getDayRange } from 'src/common/functions/utils';
import { GetSubTransactionQueryForAdminDto } from '../dto/get-sub-transaction-query.dto';
import { getUtcTimeRangeForIstRange } from 'src/coins-settlement/utils/get-coins-settlement.utils';

export function buildSubTransactiontWhereFilter({
  query,
}: {
  query: GetSubTransactionQueryForAdminDto;
}) {
  const { shopName, vendorId, userId, userName, startDate, endDate } = query;

  const where: Prisma.PaymentWhereInput = {
    purpose: PaymentPurpose.SUBSCRIPTION_PURCHASE,
  };

  if (vendorId || shopName || userName || userId) {
    where.vendorSubscription = {
      ...(vendorId && { vendorId }),
      vendor: {
        User: {
          ...(userName && {
            name: {
              contains: userName,
              mode: 'insensitive',
            },
          }),
          ...(userId && { id: userId }),
        },
        shopInfo: {
          ...(shopName && {
            name: shopName,
          }),
        },
      },
    };
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && {
        gte: getUtcTimeRangeForIstRange(new Date(startDate)).startIst,
      }),
      ...(endDate && {
        lte: getUtcTimeRangeForIstRange(new Date(endDate)).endIst,
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
