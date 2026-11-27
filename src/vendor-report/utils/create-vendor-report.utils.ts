import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVendorReportDto } from '../dto/create-vendor-report.dto';

/**
 * Resolves the target Order or Booking (by UUID or display ID),
 * verifies vendor ownership, and enforces at-most-one vendor report per transaction.
 */
export async function resolveAndValidateVendorReportTarget({
  prisma,
  vendorId,
  body,
}: {
  prisma: PrismaService;
  vendorId: string;
  body: CreateVendorReportDto;
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
        orderItems: {
          select: {
            item: { select: { vendorId: true } },
            orderItemVendorServiceOption: {
              select: {
                vendorServiceOption: { select: { vendorId: true } },
              },
            },
          },
        },
        vendorReport: { select: { id: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isAssociatedWithVendor = order.orderItems.some(
      (oi) =>
        oi.item?.vendorId === vendorId ||
        oi.orderItemVendorServiceOption?.some(
          (vso) => vso.vendorServiceOption?.vendorId === vendorId,
        ),
    );

    if (!isAssociatedWithVendor) {
      throw new ForbiddenException(
        'You are not authorized to report this order',
      );
    }

    if (order.vendorReport) {
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
      bannerBooking: { select: { vendorId: true } },
      serviceBooking: {
        select: {
          vendorSubService: {
            select: {
              service: { select: { vendorId: true } },
            },
          },
        },
      },
      vendorReport: { select: { id: true } },
    },
  });

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  const isAssociatedWithVendor =
    booking.bannerBooking?.vendorId === vendorId ||
    booking.serviceBooking?.some(
      (sb) => sb.vendorSubService?.service?.vendorId === vendorId,
    );

  if (!isAssociatedWithVendor) {
    throw new ForbiddenException(
      'You are not authorized to report this booking',
    );
  }

  if (booking.vendorReport) {
    throw new ConflictException(
      'A report has already been submitted for this booking',
    );
  }

  return { orderId: null, bookingId: booking.id, trimmedReason };
}
