import { Test, TestingModule } from '@nestjs/testing';
import { BannerVendorItemController } from './banner-vendor-item.controller';
import { BannerVendorItemService } from './banner-vendor-item.service';

describe('BannerVendorItemController', () => {
  let controller: BannerVendorItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerVendorItemController],
      providers: [BannerVendorItemService],
    }).compile();

    controller = module.get<BannerVendorItemController>(
      BannerVendorItemController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
