import { Module } from '@nestjs/common';
import { BankNameController } from './bank-name.controller';
import { BankNameNameService } from './bank-name.service';

@Module({
  controllers: [BankNameController],
  providers: [BankNameNameService],
})
export class BankNameModule {}
