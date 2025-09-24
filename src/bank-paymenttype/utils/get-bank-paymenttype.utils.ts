import { Prisma } from '@prisma/client';
import { GetBankPaymentTypeQueryDto } from '../dto/get-bank-paymenttype.dto';

export function buildBankPaymentTypeWhereFilter({
  query,
}: {
  query: GetBankPaymentTypeQueryDto;
}): Prisma.BankPaymentTypeWhereInput {
  const where: Prisma.BankPaymentTypeWhereInput = {};

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
