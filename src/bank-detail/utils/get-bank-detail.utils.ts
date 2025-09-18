import { Prisma } from '@prisma/client';
import { GetBankQueryDto } from '../dto/get-bank-query.dto';

export function buildBankDetailWhereFilter({
  query,
}: {
  query: GetBankQueryDto;
}): Prisma.BankDetailWhereInput {
  const where: Prisma.BankDetailWhereInput = {};

  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    vendorId,
    vendorName,
  } = query;

  if (accountHolderName) {
    where.accountHolderName = {
      contains: accountHolderName,
      mode: 'insensitive',
    };
  }

  if (accountNumber) {
    where.accountNumber = {
      contains: accountNumber,
      mode: 'insensitive',
    };
  }

  if (ifscCode) {
    where.ifscCode = {
      contains: ifscCode,
      mode: 'insensitive',
    };
  }

  if (bankName) {
    where.bankNameRel = {
      name: {
        contains: bankName,
        mode: 'insensitive',
      },
    };
  }

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (vendorName) {
    where.vendor = {
      User: {
        name: {
          contains: vendorName,
          mode: 'insensitive',
        },
      },
    };
  }

  return where;
}
