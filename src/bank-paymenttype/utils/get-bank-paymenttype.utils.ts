import { Prisma } from '@prisma/client';
import { GetBankPaymentTypeQueryDto } from '../dto/get-bank-paymenttype.dto';

export function buildBankPaymentTypeWhereFilter({
  query,
}: {
  query: GetBankPaymentTypeQueryDto;
}): Prisma.BankPaymentTypeWhereInput {
  const where: Prisma.BankPaymentTypeWhereInput = {};

  const { name } = query;

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  return where;
}
