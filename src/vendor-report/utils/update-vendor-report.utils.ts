import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, VendorReportStatus } from '@prisma/client';
import {
  NotificationIdentifier,
  NotificationNavigationScreen,
} from 'src/notification/constants/notification.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateVendorReportStatusDto } from '../dto/update-vendor-report-status.dto';

export type VendorReportWithTarget = Prisma.VendorReportGetPayload<{
  include: {
    vendor: {
      select: {
        id: true;
        userId: true;
        shopInfo: {
          select: {
            name: true;
          };
        };
      };
    };
    order: {
      select: {
        id: true;
        orderId: true;
        orderStatus: true;
      };
    };
    booking: {
      select: {
        id: true;
        bookedId: true;
        bookingStatus: true;
        bannerBooking: { select: { id: true } };
      };
    };
  };
}>;

/**
 * Validates Admin status transition and builds update payload for vendor report.
 */
export async function validateVendorReportStatusUpdate({
  prisma,
  reportId,
  body,
}: {
  prisma: PrismaService;
  reportId: string;
  body: UpdateVendorReportStatusDto;
}): Promise<{
  existingReport: VendorReportWithTarget;
  updateData: Prisma.VendorReportUpdateInput;
}> {
  const existingReport = await prisma.vendorReport.findUnique({
    where: { id: reportId },
    include: {
      vendor: {
        select: {
          id: true,
          userId: true,
          shopInfo: {
            select: {
              name: true,
            },
          },
        },
      },
      order: {
        select: {
          id: true,
          orderId: true,
          orderStatus: true,
        },
      },
      booking: {
        select: {
          id: true,
          bookedId: true,
          bookingStatus: true,
          bannerBooking: { select: { id: true } },
        },
      },
    },
  });

  if (!existingReport) {
    throw new NotFoundException(`Vendor report with ID ${reportId} not found`);
  }

  if (existingReport.status === body.status) {
    throw new BadRequestException(
      `Vendor report is already in ${body.status} status`,
    );
  }

  const updateData: Prisma.VendorReportUpdateInput = {
    status: body.status,
    reviewedAt: new Date(),
  };

  return { existingReport, updateData };
}

/**
 * Builds Firebase notification payload for vendor upon Admin vendor report status change.
 */
export function buildVendorReportNotificationPayload(
  report: VendorReportWithTarget,
  newStatus: VendorReportStatus,
) {
  const refLabel = report.order
    ? `Order #${report.order.orderId}`
    : report.booking
      ? `Booking #${report.booking.bookedId}`
      : 'your transaction';

  const screen = report.orderId
    ? NotificationNavigationScreen.ORDER_DETAILS
    : report.booking?.bannerBooking
      ? NotificationNavigationScreen.BANNER_BOOKING_DETAILS
      : NotificationNavigationScreen.SERVICE_BOOKING_DETAILS;

  let title = '📋 Dispute Report Status Updated';
  let content = `Your report for ${refLabel} has been updated by Admin.`;

  switch (newStatus) {
    case VendorReportStatus.VIEWED:
      title = '👀 Report Marked as Seen';
      content = `Your report for ${refLabel} has been marked as seen by Admin.`;
      break;
    case VendorReportStatus.ACCEPTED:
      title = '✅ Report Accepted by Admin';
      content = `Your report for ${refLabel} has been accepted for investigation.`;
      break;
    case VendorReportStatus.DECLINED:
      title = '❌ Report Declined by Admin';
      content = `Your report for ${refLabel} was declined by Admin.`;
      break;
    case VendorReportStatus.RESOLVED:
      title = '🛡️ Report Resolved by Admin';
      content = `Your report for ${refLabel} has been marked as resolved by Admin.`;
      break;
  }

  return {
    title,
    content,
    identifier: NotificationIdentifier.VENDOR_REPORT_STATUS_UPDATE,
    screen,
    reportId: report.id,
    reportStatus: newStatus,
    ...(report.order && {
      orderId: report.order.orderId,
      orderUuid: report.order.id,
    }),
    ...(report.booking && {
      bookingId: report.booking.id,
      bookedId: report.booking.bookedId,
    }),
  };
}
