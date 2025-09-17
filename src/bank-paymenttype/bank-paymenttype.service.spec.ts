import { Test, TestingModule } from '@nestjs/testing';
import { BankPaymenttypeService } from './bank-paymenttype.service';

describe('BankPaymenttypeService', () => {
  let service: BankPaymenttypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankPaymenttypeService],
    }).compile();

    service = module.get<BankPaymenttypeService>(BankPaymenttypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
