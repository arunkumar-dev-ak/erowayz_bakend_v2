import { Test, TestingModule } from '@nestjs/testing';
import { VendorSubscriptionController } from './vendor-subscription.controller';
import { VendorSubscriptionService } from './vendor-subscription.service';

describe('VendorSubscriptionController', () => {
  let controller: VendorSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorSubscriptionController],
      providers: [VendorSubscriptionService],
    }).compile();

    controller = module.get<VendorSubscriptionController>(
      VendorSubscriptionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
