import { Prisma } from '@prisma/client';
import { GetAdminServiceBookingQueryDto } from '../dto/service-booking-admin.dto';
import { getDayRange } from 'src/common/functions/utils';

export function buildAdminServiceBookingWhereFilter({
  query,
}: {
  query: GetAdminServiceBookingQueryDto;
}) {
  const {
    vendorName,
    startDate,
    endDate,
    userName,
    shopName,
    bookingId,
    preferredPaymentMethod,
  } = query;
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

  if (preferredPaymentMethod) {
    where.preferredPaymentMethod = preferredPaymentMethod;
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && {
        gte: getDayRange(new Date(startDate)).start,
      }),
      ...(endDate && {
        lte: getDayRange(new Date(endDate)).end,
      }),
    };
  }

  return where;
}
