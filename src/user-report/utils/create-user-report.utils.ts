import { BadRequestException } from '@nestjs/common';
import { CreateUserReportDto } from '../dto/create-user-report.dto';
import { UserReportService } from '../user-report.service';

export const CreateUserReportUtils = async ({
  body,
  userReportService,
  userId,
  isVendor,
}: {
  body: CreateUserReportDto;
  userReportService: UserReportService;
  userId: string;
  isVendor: boolean;
}) => {
  const { orderId, bookingId, report } = body;

  // Ensure report is provided
  if (!report?.trim()) {
    throw new BadRequestException('Report content is required');
  }

  // Ensure either bookingId or orderId is provided
  if (!orderId && !bookingId) {
    throw new BadRequestException('Either bookingId or orderId is required');
  }

  /* ----------------- BOOKING CASE ----------------- */
  if (bookingId) {
    const booking = await userReportService.checkBookingById({ bookingId });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (isVendor) {
      // Vendor validation
      const vendorIdFromBooking =
        booking.bannerBooking?.vendor?.User.id ||
        booking.serviceBooking[0]?.vendorSubService.service.vendor.User.id;

      if (!vendorIdFromBooking) {
        throw new BadRequestException(
          'Vendor association not found for this booking',
        );
      }

      if (vendorIdFromBooking !== userId) {
        throw new BadRequestException(
          'You are not authorized to report this booking',
        );
      }
    } else {
      // Customer validation
      if (booking.userId !== userId) {
        throw new BadRequestException('This booking does not belong to you');
      }
    }
  }

  /* ----------------- ORDER CASE ----------------- */
  if (orderId) {
    const order = await userReportService.getOrderById({ orderId });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (isVendor) {
      // Vendor validation
      const vendorIdFromOrder = order.orderItems?.[0]?.item?.vendor?.id;
      if (!vendorIdFromOrder) {
        throw new BadRequestException(
          'Vendor association not found for this order',
        );
      }
      const vendorUserIdFromOrder = order.orderItems?.[0]?.item?.vendor?.userId;

      if (vendorUserIdFromOrder !== userId) {
        throw new BadRequestException(
          'You are not authorized to report this order',
        );
      }
    } else {
      // Customer validation
      if (order.userId !== userId) {
        throw new BadRequestException('This order does not belong to you');
      }
    }
  }

  /* ----------------- SUCCESS: VALIDATION PASSED ----------------- */
  const createQuery = {
    userId,
    orderId,
    bookingId,
    report,
  };

  return { createQuery };
};
