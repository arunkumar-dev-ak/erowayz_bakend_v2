import { Prisma } from '@prisma/client';
import { GetAdminCustomerReportQueryDto } from '../dto/get-admin-customer-report-query.dto';

/**
 * Shared Prisma select shape for inline CustomerReport display on Customer/Admin
 * Order and Booking endpoints (never exposed on Vendor endpoints).
 */
export const CUSTOMER_REPORT_INLINE_SELECT = {
  select: {
    id: true,
    reason: true,
    status: true,
    reviewedAt: true,
    createdAt: true,
    updatedAt: true,
  },
} satisfies Prisma.CustomerReportDefaultArgs;

/**
 * Builds Prisma where filter for Admin Customer Concerns Dashboard.
 */
export function buildAdminCustomerReportWhereFilter({
  query,
}: {
  query: GetAdminCustomerReportQueryDto;
}): Prisma.CustomerReportWhereInput {
  const { status, targetType, search } = query;
  const where: Prisma.CustomerReportWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (targetType === 'ORDER') {
    where.orderId = { not: null };
  } else if (targetType === 'BOOKING') {
    where.bookingId = { not: null };
  }

  if (search) {
    const trimmedSearch = search.trim();
    where.OR = [
      { reason: { contains: trimmedSearch, mode: 'insensitive' } },
      { user: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
      { user: { mobile: { contains: trimmedSearch, mode: 'insensitive' } } },
      { order: { orderId: { contains: trimmedSearch, mode: 'insensitive' } } },
      {
        booking: {
          bookedId: { contains: trimmedSearch, mode: 'insensitive' },
        },
      },
    ];
  }

  return where;
}
