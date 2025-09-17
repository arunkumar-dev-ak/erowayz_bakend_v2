import { Test, TestingModule } from '@nestjs/testing';
import { PredefinedBannerController } from './predefined-banner.controller';
import { PredefinedBannerService } from './predefined-banner.service';

describe('PredefinedBannerController', () => {
  let controller: PredefinedBannerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PredefinedBannerController],
      providers: [PredefinedBannerService],
    }).compile();

    controller = module.get<PredefinedBannerController>(
      PredefinedBannerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
