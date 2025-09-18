import { Module } from '@nestjs/common';
import { BankDetailService } from './bank-detail.service';
import { BankDetailController } from './bank-detail.controller';
import { BankNameModule } from 'src/bank-name/bank-name.module';
import { BankPaymenttypeModule } from 'src/bank-paymenttype/bank-paymenttype.module';

@Module({
  imports: [BankNameModule, BankPaymenttypeModule],
  controllers: [BankDetailController],
  providers: [BankDetailService],
})
export class BankDetailModule {}
