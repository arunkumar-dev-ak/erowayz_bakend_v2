import { Prisma } from '@prisma/client';
import { GetUserReportQueryDto } from '../dto/get-user-report.dto';
import { getDayRange } from 'src/common/functions/utils';

export function buildUserReportWhereFilter({
  query,
  userId,
}: {
  query: GetUserReportQueryDto;
  userId?: string;
}): Prisma.UserReportWhereInput {
  const where: Prisma.UserReportWhereInput = {};

  const { shopName, userName, startDate, endDate } = query;

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

  if (startDate && endDate) {
    const { start } = getDayRange(new Date(startDate));
    const { end } = getDayRange(new Date(endDate));

    where.createdAt = {
      gte: start,
      lte: end,
    };
  }

  return where;
}
