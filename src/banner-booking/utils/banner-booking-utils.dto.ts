import { Prisma } from '@prisma/client';
import { GetBannerBookingQueryDto } from '../dto/get-banner-booking-query.dto';

function applyCommonBookingFilters(
  where: Prisma.BookingWhereInput,
  query: GetBannerBookingQueryDto,
) {
  const { startDate, endDate, orderStatus, bookedId } = query;

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.createdAt = new Date(startDate);
  }

  if (orderStatus) {
    where.bookingStatus = orderStatus;
  }

  if (bookedId) {
    where.bookedId = bookedId;
  }
}

// 👤 Customer filter
export function buildCustomerBannerBookingWhereFilter({
  userId,
  query,
}: {
  userId: string;
  query: GetBannerBookingQueryDto;
}) {
  const where: Prisma.BookingWhereInput = {
    userId,
    bannerBooking: {
      isNot: null,
    },
  };
  applyCommonBookingFilters(where, query);
  return where;
}

// 🧑‍🔧 Vendor filter
export function buildVendorBannerBookingWhereFilter({
  vendorId,
  query,
}: {
  vendorId: string;
  query: GetBannerBookingQueryDto;
}) {
  const where: Prisma.BookingWhereInput = {
    bannerBooking: {
      vendorId,
    },
  };
  applyCommonBookingFilters(where, query);
  return where;
}
