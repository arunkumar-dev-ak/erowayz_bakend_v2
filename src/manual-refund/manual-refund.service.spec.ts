import { Test, TestingModule } from '@nestjs/testing';
import { ManualRefundService } from './manual-refund.service';

describe('ManualRefundService', () => {
  let service: ManualRefundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManualRefundService],
    }).compile();

    service = module.get<ManualRefundService>(ManualRefundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
