import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerReportDto } from '../dto/create-customer-report.dto';

/**
 * Resolves the target Order or Booking (by UUID or human-readable ID),
 * verifies customer ownership, and enforces at-most-one report per transaction.
 */
export async function resolveAndValidateReportTarget({
  prisma,
  userId,
  body,
}: {
  prisma: PrismaService;
  userId: string;
  body: CreateCustomerReportDto;
}): Promise<{
  orderId: string | null;
  bookingId: string | null;
  trimmedReason: string;
}> {
  const trimmedReason = body.reason.trim();

  if (body.orderId) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: body.orderId }, { orderId: body.orderId }],
      },
      select: {
        id: true,
        userId: true,
        customerReport: { select: { id: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to report this order',
      );
    }

    if (order.customerReport) {
      throw new ConflictException(
        'A report has already been submitted for this order',
      );
    }

    return { orderId: order.id, bookingId: null, trimmedReason };
  }

  const booking = await prisma.booking.findFirst({
    where: {
      OR: [{ id: body.bookingId }, { bookedId: body.bookingId }],
    },
    select: {
      id: true,
      userId: true,
      customerReport: { select: { id: true } },
    },
  });

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  if (booking.userId !== userId) {
    throw new ForbiddenException(
      'You are not authorized to report this booking',
    );
  }

  if (booking.customerReport) {
    throw new ConflictException(
      'A report has already been submitted for this booking',
    );
  }

  return { orderId: null, bookingId: booking.id, trimmedReason };
}
