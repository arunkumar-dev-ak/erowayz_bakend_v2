import { Prisma } from '@prisma/client';
import { GetSubscriptionPlanQueryDto } from '../dto/get-subscription-query.dto';

export function buildSubscriptionPlanWhereFilter({
  query,
}: {
  query: GetSubscriptionPlanQueryDto;
}): Prisma.SubscriptionPlanWhereInput {
  const where: Prisma.SubscriptionPlanWhereInput = {};

  const {
    subscriptionName,
    subscriptionPlanId,
    vendorTypeId,
    billingPeriod,
    status,
    vendorCategoryType,
  } = query;

  // Filter by subscription plan name (case insensitive)
  if (subscriptionName) {
    where.name = {
      contains: subscriptionName,
      mode: 'insensitive',
    };
  }

  // Filter by subscription plan ID
  if (subscriptionPlanId) {
    where.id = subscriptionPlanId;
  }

  // Filter by vendor type ID
  if (vendorTypeId) {
    where.vendorTypeId = vendorTypeId;
  }

  if (vendorCategoryType) {
    where.vendorType = {
      type: vendorCategoryType,
    };
  }

  // Filter by billing period
  if (billingPeriod) {
    where.billingPeriod = billingPeriod;
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  return where;
}
