import { Test, TestingModule } from '@nestjs/testing';
import { CoinsSettlementService } from './coins-settlement.service';

describe('CoinsSettlementService', () => {
  let service: CoinsSettlementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinsSettlementService],
    }).compile();

    service = module.get<CoinsSettlementService>(CoinsSettlementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
