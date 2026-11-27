import { Test, TestingModule } from '@nestjs/testing';
import { UserReportService } from './user-report.service';
import { ResponseService } from 'src/response/response.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MetadataService } from 'src/metadata/metadata.service';

describe('UserReportService', () => {
  let service: UserReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserReportService,
        { provide: ResponseService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: MetadataService, useValue: {} },
      ],
    }).compile();

    service = module.get<UserReportService>(UserReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
