import { Prisma } from '@prisma/client';
import { GetAdminBannnerBookingQueryDto } from '../dto/banner-booking-admin.dto';
import { getDayRange } from 'src/common/functions/utils';

export function buildAdminBannerBookingWhereFilter({
  query,
}: {
  query: GetAdminBannnerBookingQueryDto;
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
    serviceBooking: { none: {} },
  };

  if (vendorName || shopName) {
    where.bannerBooking = {
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

  if (preferredPaymentMethod) {
    where.preferredPaymentMethod = preferredPaymentMethod;
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
        gte: getDayRange(new Date(startDate)).start,
      }),
      ...(endDate && {
        lte: getDayRange(new Date(endDate)).end,
      }),
    };
  }

  return where;
}
