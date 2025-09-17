import { Test, TestingModule } from '@nestjs/testing';
import { BannerVendorItemService } from './banner-vendor-item.service';

describe('BannerVendorItemService', () => {
  let service: BannerVendorItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerVendorItemService],
    }).compile();

    service = module.get<BannerVendorItemService>(BannerVendorItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
