import { Prisma } from '@prisma/client';
import { GetUserReportQueryDto } from '../dto/get-user-report.dto';
import { getIstTimeRange } from 'src/subscription/utils/get-sub-transaction.utils';

export function buildUserReportWhereFilter({
  query,
  userId,
}: {
  query: GetUserReportQueryDto;
  userId?: string;
}): Prisma.UserReportWhereInput {
  const where: Prisma.UserReportWhereInput = {};

  const { shopName, userName, date } = query;

  if (userId) {
    where.userId = userId;
  }

  if (shopName || userName) {
    where.user = {
      ...(userName && {
        name: {
          contains: userName,
          mode: 'insensitive',
        },
      }),
      ...(shopName && {
        vendor: {
          shopInfo: {
            name: {
              contains: shopName,
              mode: 'insensitive',
            },
          },
        },
      }),
    };
  }

  if (date) {
    const { startIst, endIst } = getIstTimeRange(new Date(date));

    where.createdAt = {
      gte: startIst,
      lte: endIst,
    };
  }

  return where;
}
