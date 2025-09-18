import { Module } from '@nestjs/common';
import { BankPaymenttypeService } from './bank-paymenttype.service';
import { BankPaymenttypeController } from './bank-paymenttype.controller';

@Module({
  controllers: [BankPaymenttypeController],
  providers: [BankPaymenttypeService],
  exports: [BankPaymenttypeService],
})
export class BankPaymenttypeModule {}
