import { Prisma } from '@prisma/client';

export function buildCustomerOrderWhereFilter({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: Prisma.OrderWhereInput = {};

  where.userId = userId;

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.createdAt = new Date(startDate);
  }

  return where;
}
