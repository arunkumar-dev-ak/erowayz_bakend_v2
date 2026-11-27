import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VendorReportService } from './vendor-report.service';
import { VendorReportStatus } from '@prisma/client';

describe('VendorReportService', () => {
  let service: VendorReportService;
  let prismaMock: any;
  let responseMock: any;
  let metadataMock: any;
  let firebaseMock: any;

  beforeEach(() => {
    prismaMock = {
      order: {
        findFirst: jest.fn(),
      },
      booking: {
        findFirst: jest.fn(),
      },
      vendorReport: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    responseMock = {
      successResponse: jest.fn(({ data, message, statusCode, meta }) => ({
        statusCode,
        message,
        data,
        meta,
      })),
    };

    metadataMock = {
      createMetaData: jest.fn().mockReturnValue({ totalCount: 1 }),
    };

    firebaseMock = {
      sendNotificationToAllSession: jest.fn().mockResolvedValue(true),
    };

    service = new VendorReportService(
      prismaMock,
      responseMock,
      metadataMock,
      firebaseMock,
    );
  });

  describe('createReport', () => {
    it('creates report for order successfully', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 'order-uuid-1',
        orderItems: [
          {
            item: { vendorId: 'vendor-123' },
            orderItemVendorServiceOption: [],
          },
        ],
        vendorReport: null,
      });

      prismaMock.vendorReport.create.mockResolvedValue({
        id: 'report-uuid-1',
        orderId: 'order-uuid-1',
        bookingId: null,
        reason: 'Customer refused to pay COD',
        status: VendorReportStatus.PENDING,
      });

      const res = {} as any;
      const result: any = await service.createReport({
        vendorId: 'vendor-123',
        body: {
          orderId: 'order-uuid-1',
          reason: '  Customer refused to pay COD  ',
        },
        res,
      });

      expect(prismaMock.vendorReport.create).toHaveBeenCalledWith({
        data: {
          vendorId: 'vendor-123',
          orderId: 'order-uuid-1',
          bookingId: null,
          reason: 'Customer refused to pay COD',
        },
        select: expect.any(Object),
      });
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Vendor dispute report submitted successfully');
    });

    it('rejects if order not found', async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      const res = {} as any;
      await expect(
        service.createReport({
          vendorId: 'vendor-123',
          body: { orderId: 'non-existent', reason: 'Issue' },
          res,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects if vendor does not own items in order', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 'order-uuid-1',
        orderItems: [
          {
            item: { vendorId: 'other-vendor' },
            orderItemVendorServiceOption: [],
          },
        ],
        vendorReport: null,
      });

      const res = {} as any;
      await expect(
        service.createReport({
          vendorId: 'vendor-123',
          body: { orderId: 'order-uuid-1', reason: 'Issue' },
          res,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects duplicate report on same order', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 'order-uuid-1',
        orderItems: [
          {
            item: { vendorId: 'vendor-123' },
            orderItemVendorServiceOption: [],
          },
        ],
        vendorReport: { id: 'existing-report-id' },
      });

      const res = {} as any;
      await expect(
        service.createReport({
          vendorId: 'vendor-123',
          body: { orderId: 'order-uuid-1', reason: 'Issue' },
          res,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAllReportsAdmin', () => {
    it('returns paginated reports for admin dashboard', async () => {
      prismaMock.vendorReport.count.mockResolvedValue(1);
      prismaMock.vendorReport.findMany.mockResolvedValue([
        { id: 'report-1', reason: 'Customer unreachable' },
      ]);

      const res = {} as any;
      const result: any = await service.getAllReportsAdmin({
        query: { offset: '0', limit: '10' },
        res,
      });

      expect(prismaMock.vendorReport.findMany).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('updateReportStatus', () => {
    it('updates status and sends Firebase push notification to vendor', async () => {
      const existingReport = {
        id: 'report-1',
        vendorId: 'vendor-123',
        status: VendorReportStatus.PENDING,
        orderId: 'order-uuid-1',
        bookingId: null,
        vendor: {
          id: 'vendor-123',
          userId: 'vendor-user-123',
          shopInfo: { name: 'Super Bakery' },
        },
        order: {
          id: 'order-uuid-1',
          orderId: 'ORD-1001',
          orderStatus: 'IN_PROGRESS',
        },
        booking: null,
      };

      prismaMock.vendorReport.findUnique.mockResolvedValue(existingReport);
      prismaMock.vendorReport.update.mockResolvedValue({
        ...existingReport,
        status: VendorReportStatus.ACCEPTED,
        reviewedAt: new Date(),
      });

      const res = {} as any;
      const result: any = await service.updateReportStatus({
        reportId: 'report-1',
        body: { status: VendorReportStatus.ACCEPTED },
        res,
      });

      expect(prismaMock.vendorReport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'report-1' },
          data: expect.objectContaining({
            status: VendorReportStatus.ACCEPTED,
          }),
        }),
      );

      expect(firebaseMock.sendNotificationToAllSession).toHaveBeenCalledWith(
        expect.objectContaining({
          receiverId: 'vendor-user-123',
          isReceiverVendor: true,
          reportStatus: VendorReportStatus.ACCEPTED,
        }),
      );

      expect(result.statusCode).toBe(200);
    });

    it('rejects update if report does not exist', async () => {
      prismaMock.vendorReport.findUnique.mockResolvedValue(null);

      const res = {} as any;
      await expect(
        service.updateReportStatus({
          reportId: 'non-existent',
          body: { status: VendorReportStatus.RESOLVED },
          res,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects update if report is already in target status', async () => {
      prismaMock.vendorReport.findUnique.mockResolvedValue({
        id: 'report-1',
        status: VendorReportStatus.RESOLVED,
      });

      const res = {} as any;
      await expect(
        service.updateReportStatus({
          reportId: 'report-1',
          body: { status: VendorReportStatus.RESOLVED },
          res,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
