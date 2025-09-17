import { Prisma } from '@prisma/client';
import { GetServiceBookingQueryDto } from '../dto/get-service-booking-query.dto';

function applyCommonBookingFilters(
  where: Prisma.BookingWhereInput,
  query: GetServiceBookingQueryDto,
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
export function buildCustomerServiceBookingWhereFilter({
  userId,
  query,
}: {
  userId: string;
  query: GetServiceBookingQueryDto;
}) {
  const where: Prisma.BookingWhereInput = {
    userId,
    serviceBooking: {
      some: {},
    },
  };
  applyCommonBookingFilters(where, query);
  return where;
}

// 🧑‍🔧 Vendor filter
export function buildVendorServiceBookingWhereFilter({
  vendorId,
  query,
}: {
  vendorId: string;
  query: GetServiceBookingQueryDto;
}) {
  const where: Prisma.BookingWhereInput = {
    serviceBooking: {
      some: {
        vendorSubService: {
          service: {
            vendorId,
          },
        },
      },
    },
  };
  applyCommonBookingFilters(where, query);
  return where;
}
