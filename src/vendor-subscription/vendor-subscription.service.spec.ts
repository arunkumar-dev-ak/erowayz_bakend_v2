import { Test, TestingModule } from '@nestjs/testing';
import { VendorSubscriptionService } from './vendor-subscription.service';

describe('VendorSubscriptionService', () => {
  let service: VendorSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorSubscriptionService],
    }).compile();

    service = module.get<VendorSubscriptionService>(VendorSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
