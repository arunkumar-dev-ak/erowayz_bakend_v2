import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomerReportStatus, Prisma } from '@prisma/client';
import {
  NotificationIdentifier,
  NotificationNavigationScreen,
} from 'src/notification/constants/notification.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCustomerReportStatusDto } from '../dto/update-customer-report-status.dto';

export type CustomerReportWithTarget = Prisma.CustomerReportGetPayload<{
  include: {
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
 * Validates Admin status transition and builds update payload.
 */
export async function validateReportStatusUpdate({
  prisma,
  reportId,
  body,
}: {
  prisma: PrismaService;
  reportId: string;
  body: UpdateCustomerReportStatusDto;
}): Promise<{
  existingReport: CustomerReportWithTarget;
  updateData: Prisma.CustomerReportUpdateInput;
}> {
  const existingReport = await prisma.customerReport.findUnique({
    where: { id: reportId },
    include: {
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
    throw new NotFoundException(
      `Customer report with ID ${reportId} not found`,
    );
  }

  if (existingReport.status === body.status) {
    throw new BadRequestException(
      `Customer report is already in ${body.status} status`,
    );
  }

  const updateData: Prisma.CustomerReportUpdateInput = {
    status: body.status,
    reviewedAt: new Date(),
  };

  return { existingReport, updateData };
}

/**
 * Builds Firebase notification payload for customer upon Admin report status change.
 */
export function buildReportNotificationPayload(
  report: CustomerReportWithTarget,
  newStatus: CustomerReportStatus,
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

  let title = '📋 Report Status Updated';
  let content = `Your report for ${refLabel} has been updated by Admin.`;

  switch (newStatus) {
    case CustomerReportStatus.VIEWED:
      title = '👀 Report Marked as Seen';
      content = `Your report for ${refLabel} has been marked as seen by Admin.`;
      break;
    case CustomerReportStatus.ACCEPTED:
      title = '✅ Report Accepted by Admin';
      content = `Your report for ${refLabel} has been accepted for review.`;
      break;
    case CustomerReportStatus.DECLINED:
      title = '❌ Report Declined by Admin';
      content = `Your report for ${refLabel} was declined by Admin.`;
      break;
    case CustomerReportStatus.RESOLVED:
      title = '🛡️ Report Resolved by Admin';
      content = `Your report for ${refLabel} has been marked as resolved by Admin.`;
      break;
  }

  return {
    title,
    content,
    identifier: NotificationIdentifier.CUSTOMER_REPORT_STATUS_UPDATE,
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
