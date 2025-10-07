import { Module } from '@nestjs/common';
import { CoinsSettlementService } from './coins-settlement.service';
import { CoinsSettlementController } from './coins-settlement.controller';

@Module({
  controllers: [CoinsSettlementController],
  providers: [CoinsSettlementService],
})
export class CoinsSettlementModule {}
