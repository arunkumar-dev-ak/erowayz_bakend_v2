import { Prisma } from '@prisma/client';
import { GetAdminVendorReportQueryDto } from '../dto/get-admin-vendor-report-query.dto';

/**
 * Shared Prisma select shape for inline VendorReport display on Vendor/Admin
 * Order and Booking endpoints (NEVER exposed on Customer endpoints).
 */
export const VENDOR_REPORT_INLINE_SELECT = {
  select: {
    id: true,
    reason: true,
    status: true,
    reviewedAt: true,
    createdAt: true,
    updatedAt: true,
  },
} satisfies Prisma.VendorReportDefaultArgs;

/**
 * Builds Prisma where filter for Admin Vendor Concerns / Reports Dashboard.
 */
export function buildAdminVendorReportWhereFilter({
  query,
}: {
  query: GetAdminVendorReportQueryDto;
}): Prisma.VendorReportWhereInput {
  const { status, targetType, search } = query;
  const where: Prisma.VendorReportWhereInput = {};

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
      {
        vendor: {
          shopInfo: { name: { contains: trimmedSearch, mode: 'insensitive' } },
        },
      },
      {
        vendor: {
          User: { name: { contains: trimmedSearch, mode: 'insensitive' } },
        },
      },
      {
        vendor: {
          User: { mobile: { contains: trimmedSearch, mode: 'insensitive' } },
        },
      },
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
