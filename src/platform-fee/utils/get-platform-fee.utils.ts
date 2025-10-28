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
    where.startAmount = {
      lte: amount,
    };
    where.endAmount = {
      gte: amount,
    };
  }

  return where;
}
