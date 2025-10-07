import { Test, TestingModule } from '@nestjs/testing';
import { CoinsSettlementController } from './coins-settlement.controller';
import { CoinsSettlementService } from './coins-settlement.service';

describe('CoinsSettlementController', () => {
  let controller: CoinsSettlementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinsSettlementController],
      providers: [CoinsSettlementService],
    }).compile();

    controller = module.get<CoinsSettlementController>(CoinsSettlementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
