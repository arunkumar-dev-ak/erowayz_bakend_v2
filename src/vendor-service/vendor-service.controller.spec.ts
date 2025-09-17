import { Test, TestingModule } from '@nestjs/testing';
import { VendorServiceController } from './vendor-service.controller';
import { VendorServiceService } from './vendor-service.service';

describe('VendorServiceController', () => {
  let controller: VendorServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorServiceController],
      providers: [VendorServiceService],
    }).compile();

    controller = module.get<VendorServiceController>(VendorServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
