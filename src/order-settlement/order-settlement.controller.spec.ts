import { Test, TestingModule } from '@nestjs/testing';
import { OrderSettlementController } from './order-settlement.controller';
import { OrderSettlementService } from './order-settlement.service';

describe('OrderSettlementController', () => {
  let controller: OrderSettlementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderSettlementController],
      providers: [OrderSettlementService],
    }).compile();

    controller = module.get<OrderSettlementController>(OrderSettlementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
