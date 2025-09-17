import { Module } from '@nestjs/common';
import { BankDetailService } from './bank-detail.service';
import { BankDetailController } from './bank-detail.controller';

@Module({
  controllers: [BankDetailController],
  providers: [BankDetailService],
})
export class BankDetailModule {}
