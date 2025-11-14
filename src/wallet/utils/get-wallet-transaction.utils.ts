import { Prisma } from '@prisma/client';
import { getDayRange } from 'src/common/functions/utils';
import { GetWalletTransactionQueryForAdminDto } from '../dto/get-wallet-transaction-query.dto';
import { getUtcTimeRangeForIstRange } from 'src/coins-settlement/utils/get-coins-settlement.utils';

export function buildWalletTransactiontWhereFilter({
  query,
}: {
  query: GetWalletTransactionQueryForAdminDto;
}) {
  const { shopName, vendorId, userId, userName, startDate, endDate } = query;

  const where: Prisma.WalletTransactionWhereInput = {};

  const conditions: Prisma.WalletTransactionWhereInput[] = [];

  if (vendorId || shopName || userName || userId) {
    conditions.push({
      senderWallet: {
        is: {
          user: {
            is: {
              ...(userId && { id: userId }),
              ...(userName && {
                name: {
                  equals: userName,
                  mode: 'insensitive',
                },
              }),
              vendor: {
                ...(vendorId && { id: vendorId }),
                ...(shopName && {
                  shopInfo: {
                    name: {
                      equals: shopName,
                      mode: 'insensitive',
                    },
                  },
                }),
              },
            },
          },
        },
      },
    });
    conditions.push({
      receiverWallet: {
        is: {
          user: {
            is: {
              ...(userId && { id: userId }),
              ...(userName && { name: userName }),
              vendor: {
                ...(vendorId && { id: vendorId }),
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
    });
  }

  if (conditions.length > 0) {
    where.OR = conditions;
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
