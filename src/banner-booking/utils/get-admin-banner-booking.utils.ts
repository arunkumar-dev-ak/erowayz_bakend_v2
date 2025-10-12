import { Prisma } from '@prisma/client';
import { GetAdminBannnerBookingQueryDto } from '../dto/banner-booking-admin.dto';
import { getIstTimeRange } from 'src/subscription/utils/get-sub-transaction.utils';

export function buildAdminBannerBookingWhereFilter({
  query,
}: {
  query: GetAdminBannnerBookingQueryDto;
}) {
  const { vendorName, startDate, endDate, userName, shopName, bookingId } =
    query;
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
