import { Prisma } from '@prisma/client';
import { GetPlatformFeeQueryDto } from '../dto/get-platform-fee.dto';

export function buildPlatformFeeWhereFilter({
  query,
}: {
  query: GetPlatformFeeQueryDto;
}): Prisma.PlatformFeesWhereInput {
  const where: Prisma.PlatformFeesWhereInput = {};

  const { amount } = query;

  if (amount) {
    where.fee = {
      lte: amount,
    };
    where.fee = {
      gte: amount,
    };
  }

  return where;
}
