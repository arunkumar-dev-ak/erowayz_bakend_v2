import { Test, TestingModule } from '@nestjs/testing';
import { OrderSettlementService } from './order-settlement.service';

describe('OrderSettlementService', () => {
  let service: OrderSettlementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderSettlementService],
    }).compile();

    service = module.get<OrderSettlementService>(OrderSettlementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
