import { Prisma } from '@prisma/client';
import { GetErrorLogQueryDto } from '../dto/get-error-log.dto';

export function buildErrorLogWhereFilter({
  query,
}: {
  query: GetErrorLogQueryDto;
}): Prisma.PaymentErrorLogWhereInput {
  const where: Prisma.PaymentErrorLogWhereInput = {};

  const { userName } = query;

  if (userName) {
    where.customerUser = {
      name: {
        contains: userName,
        mode: 'insensitive',
      },
    };
    where.vendorUser = {
      name: {
        contains: userName,
        mode: 'insensitive',
      },
    };
  }

  return where;
}
