import { Test, TestingModule } from '@nestjs/testing';
import { VendorTypeController } from './vendor-type.controller';

describe('VendorTypeController', () => {
  let controller: VendorTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorTypeController],
    }).compile();

    controller = module.get<VendorTypeController>(VendorTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
