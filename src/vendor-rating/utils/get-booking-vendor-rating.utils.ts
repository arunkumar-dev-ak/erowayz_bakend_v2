import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface MyLastBookingResult {
  id: string;
  bookingId: string;
  bookingType: 'SERVICE' | 'BANNER';
  status: OrderStatus;
  createdAt: Date;
}

/*----- utils: fetch customer's last completed booking (Service or Banner) for vendor -----*/
export async function fetchMyLastCompletedBooking({
  prisma,
  userId,
  vendorId,
}: {
  prisma: PrismaService;
  userId: string;
  vendorId: string;
}): Promise<MyLastBookingResult | null> {
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
      bookingStatus: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      OR: [
        {
          serviceBooking: {
            some: {
              vendorSubService: {
                service: {
                  vendorId,
                },
              },
            },
          },
        },
        {
          bannerBooking: {
            vendorId,
          },
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      bookedId: true,
      bookingStatus: true,
      createdAt: true,
      bannerBooking: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!booking) return null;

  return {
    id: booking.id,
    bookingId: booking.bookedId,
    bookingType: booking.bannerBooking ? 'BANNER' : 'SERVICE',
    status: booking.bookingStatus,
    createdAt: booking.createdAt,
  };
}
