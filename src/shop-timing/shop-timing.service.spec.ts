import { Test, TestingModule } from '@nestjs/testing';
import { ShopTimingService } from './shop-timing.service';

describe('ShopTimingService', () => {
  let service: ShopTimingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopTimingService],
    }).compile();

    service = module.get<ShopTimingService>(ShopTimingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
