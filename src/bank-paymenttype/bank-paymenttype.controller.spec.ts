import { Test, TestingModule } from '@nestjs/testing';
import { BankPaymenttypeController } from './bank-paymenttype.controller';
import { BankPaymenttypeService } from './bank-paymenttype.service';

describe('BankPaymenttypeController', () => {
  let controller: BankPaymenttypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankPaymenttypeController],
      providers: [BankPaymenttypeService],
    }).compile();

    controller = module.get<BankPaymenttypeController>(BankPaymenttypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
