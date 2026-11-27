import { VendorReportController } from './vendor-report.controller';
import { VendorReportService } from './vendor-report.service';
import { VendorReportStatus } from '@prisma/client';

describe('VendorReportController', () => {
  let controller: VendorReportController;
  let serviceMock: Partial<VendorReportService>;

  beforeEach(() => {
    serviceMock = {
      createReport: jest.fn().mockResolvedValue({ statusCode: 201 }),
      getAllReportsAdmin: jest.fn().mockResolvedValue({ statusCode: 200 }),
      updateReportStatus: jest.fn().mockResolvedValue({ statusCode: 200 }),
    };
    controller = new VendorReportController(
      serviceMock as VendorReportService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates createReport with vendorId from request', async () => {
    const req = { vendorId: 'vendor-123' } as any;
    const res = {} as any;
    const body = { orderId: 'ord-1', reason: 'Customer refused COD delivery' };

    await controller.createReport(req, res, body);

    expect(serviceMock.createReport).toHaveBeenCalledWith({
      vendorId: 'vendor-123',
      body,
      res,
    });
  });

  it('delegates getAllReportsAdmin with query', async () => {
    const res = {} as any;
    const query = { status: VendorReportStatus.PENDING, offset: '0', limit: '10' };

    await controller.getAllReportsAdmin(query, res);

    expect(serviceMock.getAllReportsAdmin).toHaveBeenCalledWith({
      query,
      res,
    });
  });

  it('delegates updateReportStatus with id and body', async () => {
    const res = {} as any;
    const body = { status: VendorReportStatus.ACCEPTED };

    await controller.updateReportStatus('report-uuid-1', body, res);

    expect(serviceMock.updateReportStatus).toHaveBeenCalledWith({
      reportId: 'report-uuid-1',
      body,
      res,
    });
  });
});
