import { Test, TestingModule } from '@nestjs/testing';
import { VendorServiceOptionController } from './vendor-service-option.controller';
import { VendorServiceOptionService } from './vendor-service-option.service';

describe('VendorServiceOptionController', () => {
  let controller: VendorServiceOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorServiceOptionController],
      providers: [VendorServiceOptionService],
    }).compile();

    controller = module.get<VendorServiceOptionController>(
      VendorServiceOptionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
