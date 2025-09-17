import { Test, TestingModule } from '@nestjs/testing';
import { ShopInfoController } from './shop-info.controller';
import { ShopInfoService } from './shop-info.service';

describe('ShopInfoController', () => {
  let controller: ShopInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopInfoController],
      providers: [ShopInfoService],
    }).compile();

    controller = module.get<ShopInfoController>(ShopInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
