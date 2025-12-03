import { Prisma } from '@prisma/client';
import { GetVendorSubscriptionQueryForAdmin } from '../dto/get-vendor-sub.query.dto';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';
import { getUtcTimeRangeForIstRange } from 'src/coins-settlement/utils/get-coins-settlement.utils';

export function buildVendorSubWhereFilter({
  query,
}: {
  query: GetVendorSubscriptionQueryForAdmin;
}): Prisma.VendorSubscriptionWhereInput {
  const {
    isActive,
    vendorId,
    subscriptionName,
    type,
    startDate,
    endDate,
    shopName,
  } = query;

  const subscriptionType =
    type === 'paid' ? 'paid' : type === 'free' ? 'free' : undefined;

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

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && {
        gte: getUtcTimeRangeForIstRange(new Date(startDate)).startIst,
      }),
      ...(endDate && {
        lte: getUtcTimeRangeForIstRange(new Date(endDate)).endIst,
      }),
    };
  }

  if (shopName) {
    where.vendor = {
      shopInfo: {
        name: {
          contains: shopName,
          mode: 'insensitive',
        },
      },
    };
  }

  if (subscriptionType === 'paid') {
    where.paymentId = { not: null };
  } else if (subscriptionType === 'free') {
    where.paymentId = { equals: null };
  }

  return where;
}
