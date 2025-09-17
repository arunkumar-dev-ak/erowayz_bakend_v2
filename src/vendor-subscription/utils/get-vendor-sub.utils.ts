import { Prisma } from '@prisma/client';
import { GetVendorSubscriptionQueryForAdmin } from '../dto/get-vendor-sub.query.dto';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';

export function buildVendorSubWhereFilter({
  query,
}: {
  query: GetVendorSubscriptionQueryForAdmin;
}): Prisma.VendorSubscriptionWhereInput {
  const { isActive, vendorId, subscriptionName } = query;

  const where: Prisma.VendorSubscriptionWhereInput = {};

  if (isActive) {
    where.isActive = TrueOrFalseMap[isActive];
  }

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (subscriptionName) {
    where.planName = {
      contains: subscriptionName,
      mode: 'insensitive',
    };
  }

  return where;
}
