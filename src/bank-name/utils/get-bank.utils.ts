import { Prisma } from '@prisma/client';
import { GetBankNameQueryDto } from '../dto/get-bank.dto';

export function buildBankNameWhereFilter({
  query,
}: {
  query: GetBankNameQueryDto;
}): Prisma.BankNameWhereInput {
  const where: Prisma.BankNameWhereInput = {};

  const { name, status } = query;

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  if (status) {
    where.status = status;
  }

  return where;
}
