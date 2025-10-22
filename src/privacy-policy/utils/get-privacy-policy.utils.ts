// utils/get-privacy-policy.utils.ts
import { Prisma } from '@prisma/client';
import { GetPrivacyPolicyQueryDto } from '../dto/get-privacy-policy.dto';

export function buildPrivacyPolicyWhereFilter({
  query,
}: {
  query: GetPrivacyPolicyQueryDto;
}): Prisma.PrivacyPolicyWhereInput {
  const where: Prisma.PrivacyPolicyWhereInput = {};

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
