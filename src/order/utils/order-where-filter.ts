import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';

export function buildOrderWhereFilter({
  vendorId,
  startDate,
  endDate,
  serviceOptionsIds,
  paymentMode,
  orderStatus,
}: {
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  serviceOptionsIds?: string;
  paymentMode?: PaymentMethod;
  orderStatus?: OrderStatus;
}) {
  const where: Prisma.OrderWhereInput = {};

  if (vendorId || serviceOptionsIds) {
    where.orderItems = {
      some: {
        orderItemVendorServiceOption: {
          some: {
            vendorServiceOption: {
              ...(vendorId && { vendorId }),
              ...(serviceOptionsIds && { serviceOptionId: serviceOptionsIds }),
            },
          },
        },
      },
    };
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.createdAt = new Date(startDate);
  }

  if (paymentMode) {
    where.orderPayment = {
      type: paymentMode,
    };
  }

  if (orderStatus) {
    where.orderStatus = orderStatus;
  }

  return where;
}
