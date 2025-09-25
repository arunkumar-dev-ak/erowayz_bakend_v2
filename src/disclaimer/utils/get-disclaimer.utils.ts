// utils/get-terms-and-condition.utils.ts
import { Prisma } from '@prisma/client';
import { GetDisclaimerQueryDto } from '../dto/get-discalimer.dto';

export function buildDiscalimerWhereFilter({
  query,
}: {
  query: GetDisclaimerQueryDto;
}): Prisma.DisclaimerWhereInput {
  const where: Prisma.DisclaimerWhereInput = {};

  const { disclaimerType } = query;

  if (disclaimerType) {
    where.disclaimerType = disclaimerType;
  }

  return where;
}
