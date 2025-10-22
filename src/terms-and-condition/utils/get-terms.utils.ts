// utils/get-terms-and-condition.utils.ts
import { Prisma } from '@prisma/client';
import { GetTermsAndConditionQueryDto } from '../dto/get-terms-query.dto';

export function buildTermsAndConditionWhereFilter({
  query,
}: {
  query: GetTermsAndConditionQueryDto;
}): Prisma.TermsAndConditionWhereInput {
  const where: Prisma.TermsAndConditionWhereInput = {};

  const { userType, vendorTypeId, vendorTypeName, type } = query;

  if (userType) {
    where.userType = userType;
  }

  if (vendorTypeId) {
    where.vendorTypeId = vendorTypeId;
  }

  if (type) {
    where.type = type;
  }

  if (vendorTypeName) {
    where.vendorType = {
      name: {
        contains: vendorTypeName,
        mode: 'insensitive',
      },
    };
  }

  return where;
}
