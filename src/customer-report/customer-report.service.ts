import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateCustomerReportDto } from './dto/create-customer-report.dto';
import { GetAdminCustomerReportQueryDto } from './dto/get-admin-customer-report-query.dto';
import { UpdateCustomerReportStatusDto } from './dto/update-customer-report-status.dto';
import { resolveAndValidateReportTarget } from './utils/create-customer-report.utils';
import { buildAdminCustomerReportWhereFilter } from './utils/get-customer-report.utils';
import {
  buildReportNotificationPayload,
  validateReportStatusUpdate,
} from './utils/update-customer-report.utils';

@Injectable()
export class CustomerReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metadataService: MetadataService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  /**
   * Customer: Submit a text-only report inline for an Order or Booking.
   * Allowed across any order/booking status, max 1 report per transaction.
   */
  async createReport({
    userId,
    body,
    res,
  }: {
    userId: string;
    body: CreateCustomerReportDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { orderId, bookingId, trimmedReason } =
      await resolveAndValidateReportTarget({
        prisma: this.prisma,
        userId,
        body,
      });

    const report = await this.prisma.customerReport.create({
      data: {
        userId,
        orderId,
        bookingId,
        reason: trimmedReason,
      },
      select: {
        id: true,
        orderId: true,
        bookingId: true,
        reason: true,
        status: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.response.successResponse({
      res,
      data: report,
      message: 'Customer report submitted successfully',
      statusCode: 201,
      initialDate,
    });
  }

  /**
   * Admin: Paginated list of all customer reports for Admin Concerns Dashboard.
   */
  async getAllReportsAdmin({
    query,
    res,
  }: {
    query: GetAdminCustomerReportQueryDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { status, targetType, search } = query;
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '10');

    const where = buildAdminCustomerReportWhereFilter({ query });

    const [totalCount, reports] = await Promise.all([
      this.prisma.customerReport.count({ where }),
      this.prisma.customerReport.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nameTamil: true,
              mobile: true,
              email: true,
              imageRef: true,
            },
          },
          order: {
            select: {
              id: true,
              orderId: true,
              orderStatus: true,
              preferredPaymentMethod: true,
              finalPayableAmount: true,
              totalPrice: true,
              createdAt: true,
            },
          },
          booking: {
            select: {
              id: true,
              bookedId: true,
              bookingStatus: true,
              createdAt: true,
              bannerBooking: {
                select: {
                  id: true,
                  bannerName: true,
                  vendorId: true,
                  vendor: {
                    select: {
                      id: true,
                      shopInfo: { select: { name: true, nameTamil: true } },
                    },
                  },
                },
              },
              serviceBooking: {
                take: 1,
                select: {
                  id: true,
                  vendorSubService: {
                    select: {
                      service: {
                        select: {
                          vendorId: true,
                          vendor: {
                            select: {
                              id: true,
                              shopInfo: {
                                select: { name: true, nameTamil: true },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const queries = buildQueryParams({
      status,
      targetType,
      search,
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'customer-report/admin',
      queries,
    });

    return this.response.successResponse({
      res,
      data: reports,
      meta,
      message: 'Customer reports retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /**
   * Admin: Updates report resolution status (VIEWED / ACCEPTED / DECLINED / RESOLVED)
   * and triggers a Firebase push notification to the customer.
   */
  async updateReportStatus({
    reportId,
    body,
    res,
  }: {
    reportId: string;
    body: UpdateCustomerReportStatusDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { existingReport, updateData } = await validateReportStatusUpdate({
      prisma: this.prisma,
      reportId,
      body,
    });

    const updatedReport = await this.prisma.customerReport.update({
      where: { id: reportId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
    });

    const notificationPayload = buildReportNotificationPayload(
      existingReport,
      body.status,
    );

    await this.firebaseNotificationService.sendNotificationToAllSession({
      receiverId: existingReport.userId,
      isReceiverVendor: false,
      ...notificationPayload,
    });

    return this.response.successResponse({
      res,
      data: updatedReport,
      message: `Customer report updated to ${body.status} successfully`,
      statusCode: 200,
      initialDate,
    });
  }
}
