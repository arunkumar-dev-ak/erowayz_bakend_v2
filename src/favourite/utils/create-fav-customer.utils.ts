import { OrderService } from 'src/order/order.service';
import { CreateFavouriteCustomerForVendorDto } from '../dto/create-favourite-customer.dto';
import { FavouriteService } from '../favourite.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export async function createFavouriteCustomerForVendorUtils({
  body,
  favouriteService,
  orderService,
  vendorId,
}: {
  body: CreateFavouriteCustomerForVendorDto;
  favouriteService: FavouriteService;
  orderService: OrderService;
  vendorId: string;
}) {
  const { orderItemId, bookingId } = body;

  const [orderItem, booking] = await Promise.all([
    orderItemId ? orderService.getOrderItemsById(orderItemId) : null,
    bookingId ? favouriteService.getBookingById(bookingId) : null,
  ]);

  let userId: string | undefined;

  // Validate order item
  if (orderItemId && !orderItem) {
    throw new BadRequestException('Order not found');
  }

  if (orderItem) {
    if (orderItem.item.vendorId !== vendorId) {
      throw new BadRequestException('Vendor does not match with the OrderItem');
    }
    userId = orderItem.order.userId;
  }

  // Validate booking
  if (bookingId && !booking) {
    throw new BadRequestException('Booking not found');
  }

  if (booking) {
    const hasServiceBooking = booking.serviceBooking?.length > 0;
    const hasBannerBooking = !!booking.bannerBooking;

    if (!hasServiceBooking && !hasBannerBooking) {
      throw new BadRequestException(
        'Invalid booking: neither serviceBooking nor bannerBooking exists',
      );
    }

    const bookingVendorId =
      booking.bannerBooking?.vendorId ||
      booking.serviceBooking?.[0]?.vendorSubService?.service.vendorId;

    if (!bookingVendorId || bookingVendorId !== vendorId) {
      throw new BadRequestException('Vendor does not match with the booking');
    }

    userId = booking.userId;
  }

  if (!userId) {
    throw new BadRequestException('UserId could not be resolved');
  }

  const alreadyExistingCustomer =
    await favouriteService.checkCustomerUnderFavourite(userId, vendorId);
  if (alreadyExistingCustomer) {
    throw new BadRequestException('Customer already under favourite list');
  }

  const createQuery: Prisma.FavouriteCustomerForVendorCreateInput = {
    user: {
      connect: {
        id: userId,
      },
    },
    vendor: {
      connect: {
        id: vendorId,
      },
    },
  };

  return { createQuery };
}
