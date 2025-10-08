import { Prisma } from '@prisma/client';
import { GetCoinSettlementQueryDto } from '../dto/get-coins-settlement';
import { getDayRange } from 'src/common/functions/utils';

export function buildCoinSettlementWhereFilter({
  query,
}: {
  query: GetCoinSettlementQueryDto;
}) {
  const {
    shopName,
    id,
    vendorId,
    walletTransactionId,
    vendorName,
    startDate,
    endDate,
  } = query;

  const where: Prisma.CoinsSettlementWhereInput = {
    walletTransaction: {
      transactionType: 'VENDOR_TO_ADMIN_REFUND',
    },
  };

  if (id) {
    where.id = id;
  }

  if (walletTransactionId) {
    where.walletTransactionId = walletTransactionId;
  }

  if (vendorId || shopName || vendorName || startDate || endDate) {
    where.walletTransaction = {
      transactionType: 'VENDOR_TO_ADMIN_REFUND',
      senderWallet: {
        is: {
          user: {
            is: {
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
      createdAt: {
        ...(startDate && {
          gte: getIstTimeRange(new Date(startDate)).startIst,
        }),
        ...(endDate && {
          lte: getIstTimeRange(new Date(endDate)).endIst,
        }),
      },
    };
  }

  return { where };
}

export function buildWalletTransactionWhereFilter({
  vendorId,
  query,
}: {
  vendorId?: string;
  query: GetCoinSettlementQueryDto;
}) {
  const { walletTransactionId, startDate, endDate } = query;

  const where: Prisma.WalletTransactionWhereInput = {
    transactionType: 'VENDOR_TO_ADMIN_REFUND',
    ...(walletTransactionId && { id: walletTransactionId }),
    senderWallet: {
      is: {
        user: {
          is: {
            vendor: {
              ...(vendorId && { id: vendorId }),
            },
          },
        },
      },
    },
    createdAt: {
      ...(startDate && {
        gte: getIstTimeRange(new Date(startDate)).startIst,
      }),
      ...(endDate && {
        lte: getIstTimeRange(new Date(endDate)).endIst,
      }),
    },
  };

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
