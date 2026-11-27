import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateVendorReportDto } from './dto/create-vendor-report.dto';
import { GetAdminVendorReportQueryDto } from './dto/get-admin-vendor-report-query.dto';
import { UpdateVendorReportStatusDto } from './dto/update-vendor-report-status.dto';
import { resolveAndValidateVendorReportTarget } from './utils/create-vendor-report.utils';
import { buildAdminVendorReportWhereFilter } from './utils/get-vendor-report.utils';
import {
  buildVendorReportNotificationPayload,
  validateVendorReportStatusUpdate,
} from './utils/update-vendor-report.utils';

@Injectable()
export class VendorReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metadataService: MetadataService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  /**
   * Vendor / Staff: Submit a dispute/concern report inline for an Order or Booking against customer.
   * Allowed across any order/booking status, max 1 report per transaction.
   */
  async createReport({
    vendorId,
    body,
    res,
  }: {
    vendorId: string;
    body: CreateVendorReportDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { orderId, bookingId, trimmedReason } =
      await resolveAndValidateVendorReportTarget({
        prisma: this.prisma,
        vendorId,
        body,
      });

    const report = await this.prisma.vendorReport.create({
      data: {
        vendorId,
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
      message: 'Vendor dispute report submitted successfully',
      statusCode: 201,
      initialDate,
    });
  }

  /**
   * Admin: Paginated list of all vendor reports for Admin Concerns / Disputes Dashboard.
   */
  async getAllReportsAdmin({
    query,
    res,
  }: {
    query: GetAdminVendorReportQueryDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { status, targetType, search } = query;
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '10');

    const where = buildAdminVendorReportWhereFilter({ query });

    const [totalCount, reports] = await Promise.all([
      this.prisma.vendorReport.count({ where }),
      this.prisma.vendorReport.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              shopInfo: {
                select: {
                  name: true,
                  nameTamil: true,
                },
              },
              User: {
                select: {
                  id: true,
                  name: true,
                  nameTamil: true,
                  mobile: true,
                  email: true,
                  imageRef: true,
                },
              },
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
              orderedUser: {
                select: {
                  id: true,
                  name: true,
                  nameTamil: true,
                  mobile: true,
                  email: true,
                },
              },
            },
          },
          booking: {
            select: {
              id: true,
              bookedId: true,
              bookingStatus: true,
              createdAt: true,
              bookedUser: {
                select: {
                  id: true,
                  name: true,
                  nameTamil: true,
                  mobile: true,
                  email: true,
                },
              },
              bannerBooking: {
                select: {
                  id: true,
                  bannerName: true,
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
                          id: true,
                          serviceOption: {
                            select: {
                              name: true,
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
      path: 'vendor-report/admin',
      queries,
    });

    return this.response.successResponse({
      res,
      data: reports,
      meta,
      message: 'Vendor reports retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /**
   * Admin: Updates vendor report resolution status (VIEWED / ACCEPTED / DECLINED / RESOLVED)
   * and triggers a Firebase push notification to the vendor.
   */
  async updateReportStatus({
    reportId,
    body,
    res,
  }: {
    reportId: string;
    body: UpdateVendorReportStatusDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { existingReport, updateData } =
      await validateVendorReportStatusUpdate({
        prisma: this.prisma,
        reportId,
        body,
      });

    const updatedReport = await this.prisma.vendorReport.update({
      where: { id: reportId },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            shopInfo: {
              select: {
                name: true,
              },
            },
            User: {
              select: {
                id: true,
                name: true,
                mobile: true,
              },
            },
          },
        },
      },
    });

    const notificationPayload = buildVendorReportNotificationPayload(
      existingReport,
      body.status,
    );

    await this.firebaseNotificationService.sendNotificationToAllSession({
      receiverId: existingReport.vendor.userId,
      isReceiverVendor: true,
      ...notificationPayload,
    });

    return this.response.successResponse({
      res,
      data: updatedReport,
      message: `Vendor report updated to ${body.status} successfully`,
      statusCode: 200,
      initialDate,
    });
  }
}
