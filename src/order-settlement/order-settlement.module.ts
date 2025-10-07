import { Module } from '@nestjs/common';
import { OrderSettlementService } from './order-settlement.service';
import { OrderSettlementController } from './order-settlement.controller';
import { VendorModule } from 'src/vendor/vendor.module';

@Module({
  imports: [VendorModule],
  controllers: [OrderSettlementController],
  providers: [OrderSettlementService],
})
export class OrderSettlementModule {}
