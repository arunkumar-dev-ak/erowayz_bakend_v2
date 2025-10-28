import { Test, TestingModule } from '@nestjs/testing';
import { UserReportController } from './user-report.controller';
import { UserReportService } from './user-report.service';

describe('UserReportController', () => {
  let controller: UserReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReportController],
      providers: [UserReportService],
    }).compile();

    controller = module.get<UserReportController>(UserReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
