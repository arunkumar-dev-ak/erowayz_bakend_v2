import { Test, TestingModule } from '@nestjs/testing';
import { ShopTimingController } from './shop-timing.controller';
import { ShopTimingService } from './shop-timing.service';

describe('ShopTimingController', () => {
  let controller: ShopTimingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopTimingController],
      providers: [ShopTimingService],
    }).compile();

    controller = module.get<ShopTimingController>(ShopTimingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
