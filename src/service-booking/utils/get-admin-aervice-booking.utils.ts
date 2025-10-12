import { Prisma } from '@prisma/client';
import { getIstTimeRange } from 'src/subscription/utils/get-sub-transaction.utils';
import { GetAdminServiceBookingQueryDto } from '../dto/service-booking-admin.dto';

export function buildAdminServiceBookingWhereFilter({
  query,
}: {
  query: GetAdminServiceBookingQueryDto;
}) {
  const { vendorName, startDate, endDate, userName, shopName, bookingId } =
    query;
  const where: Prisma.BookingWhereInput = {
    bannerBooking: { is: null },
  };

  if (vendorName || shopName) {
    where.serviceBooking = {
      some: {
        vendorSubService: {
          service: {
            vendor: {
              ...(vendorName && {
                User: {
                  name: {
                    contains: vendorName,
                    mode: 'insensitive',
                  },
                },
              }),
              ...(shopName && {
                shopInfo: {
                  name: {
                    contains: shopName,
                    mode: 'insensitive',
                  },
                },
              }),
            },
          },
        },
      },
    };
  }

  if (userName) {
    where.bookedUser = {
      name: {
        contains: userName,
        mode: 'insensitive',
      },
    };
  }

  if (bookingId) {
    where.bookedId = {
      contains: bookingId,
      mode: 'insensitive',
    };
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && {
        gte: getIstTimeRange(new Date(startDate)).startIst,
      }),
      ...(endDate && {
        lte: getIstTimeRange(new Date(endDate)).endIst,
      }),
    };
  }

  return where;
}
