import { Test, TestingModule } from '@nestjs/testing';
import { PredefinedBannerService } from './predefined-banner.service';

describe('PredefinedBannerService', () => {
  let service: PredefinedBannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PredefinedBannerService],
    }).compile();

    service = module.get<PredefinedBannerService>(PredefinedBannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
