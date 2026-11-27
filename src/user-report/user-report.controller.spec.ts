import { UserReportController } from './user-report.controller';
import { UserReportService } from './user-report.service';

describe('UserReportController', () => {
  let controller: UserReportController;
  let serviceMock: UserReportService;

  beforeEach(() => {
    serviceMock = {} as UserReportService;
    controller = new UserReportController(serviceMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('throws 426 Upgrade Required for legacy getUserReports', async () => {
    const res = {} as any;
    await expect(controller.getUserReports(res, {} as any)).rejects.toThrow(
      'To use Customer Concerns & Support, please update your Erowayz app to the latest version.',
    );
  });

  it('throws 426 Upgrade Required for legacy createUserReport', async () => {
    const res = {} as any;
    const req = {} as any;
    await expect(
      controller.createUserReport(res, req, {} as any, {} as any),
    ).rejects.toThrow(
      'To use Customer Concerns & Support, please update your Erowayz app to the latest version.',
    );
  });
});
