import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { VendorService } from 'src/vendor/vendor.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Prisma } from '@prisma/client';

export async function CreateReviewUtils({
  body,
  userId,
  orderService,
  vendorService,
}: {
  body: CreateReviewDto;
  userId: string;
  orderService: OrderService;
  vendorService: VendorService;
}): Promise<Prisma.ReviewUpsertArgs> {
  const { orderItemId, vendorId, review, rating } = body;

  // Validate orderItemId if present
  if (orderItemId) {
    const orderItem = await orderService.getOrderItemsById(orderItemId);
    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    if (orderItem.order.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to review this order item',
      );
    }

    if (
      orderItem.order.orderStatus !== 'COMPLETED' &&
      orderItem.order.orderStatus !== 'DELIVERED'
    ) {
      throw new ForbiddenException(
        'You can only review items from orders that are completed or delivered',
      );
    }
  }

  // Validate vendorId if present
  if (vendorId) {
    const existingVendor = await vendorService.findVendorById({ id: vendorId });
    if (!existingVendor) {
      throw new NotFoundException('Vendor not found');
    }
  }

  const upsertReviewArgs: Prisma.ReviewUpsertArgs = {
    where: orderItemId
      ? { userId_orderItemId: { userId, orderItemId } }
      : { userId_vendorId: { userId, vendorId: vendorId! } },
    create: {
      userId,
      orderItemId,
      vendorId,
      rating,
      review,
    },
    update: {
      rating,
      review,
      updatedAt: new Date(),
    },
  };

  return upsertReviewArgs;
}
