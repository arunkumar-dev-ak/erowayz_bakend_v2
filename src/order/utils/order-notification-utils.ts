import { OrderStatus } from '@prisma/client';

export function getNotificationContentForOrderStatus({
  role,
  status,
  orderId,
}: {
  role: 'vendor' | 'customer';
  status: OrderStatus;
  orderId: string;
}): { title: string; body: string } {
  switch (status) {
    case OrderStatus.IN_PROGRESS:
      return {
        title: '✅ Order Accepted',
        body: `Your order #${orderId} has been accepted by the vendor.`,
      };

    case OrderStatus.CANCELLED:
      return {
        title: '❌ Order Cancelled',
        body:
          role === 'vendor'
            ? `Your order #${orderId} was cancelled by the vendor.`
            : `Customer has cancelled order #${orderId}.`,
      };

    case OrderStatus.COMPLETED:
      return {
        title: '✅ Order Completed',
        body: `Your order #${orderId} has been marked as completed.`,
      };

    case OrderStatus.DELIVERED:
      return {
        title: '📦 Order Delivered',
        body: `Your order #${orderId} has been delivered.`,
      };

    default:
      return {
        title: '📢 Order Update',
        body: `Order #${orderId} has a new status update.`,
      };
  }
}
