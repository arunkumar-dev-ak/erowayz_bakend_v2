import { OrderStatus, Prisma } from '@prisma/client';

type BookingWithVendorUser = Prisma.BookingGetPayload<{
  include: {
    bannerBooking: {
      include: {
        vendor: {
          include: {
            User: true;
          };
        };
      };
    };
  };
}>;

export function getNotificationContentForBannerBookingStatus({
  userId,
  updatedBooking,
  status,
}: {
  userId: string;
  status: OrderStatus;
  updatedBooking: BookingWithVendorUser;
}): {
  title: string;
  content: string;
  receiverId: string;
  isReceiverVendor: boolean;
} | null {
  const vendorUserId = updatedBooking.bannerBooking?.vendor.userId;

  const bookingId = updatedBooking.bookedId;

  const isSenderVendor = userId === vendorUserId;
  const receiverId = isSenderVendor ? updatedBooking.userId : vendorUserId;
  const isReceiverVendor = !isSenderVendor;

  let title = '📢 Booking Update';
  let content = `Booking #${bookingId} has a new status update.`;

  switch (status) {
    case OrderStatus.IN_PROGRESS:
      title = '✅ Booking Accepted';
      content = `Your booking #${bookingId} has been accepted by the vendor.`;
      break;

    case OrderStatus.CANCELLED:
      title = '❌ Booking Cancelled';
      content = isSenderVendor
        ? `Your booking #${bookingId} was cancelled by the vendor.`
        : `Customer has cancelled booking #${bookingId}.`;
      break;

    case OrderStatus.COMPLETED:
      title = '✅ Booking Completed';
      content = `Your booking #${bookingId} has been marked as completed.`;
      break;
  }

  if (!receiverId) {
    console.warn(
      `Receiver Id ${receiverId} not found to trigger a notification`,
    );
    return null;
  }

  return { title, content, receiverId, isReceiverVendor };
}
