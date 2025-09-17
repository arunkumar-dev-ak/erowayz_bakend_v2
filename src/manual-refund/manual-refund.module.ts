import { Module } from '@nestjs/common';
import { ManualRefundService } from './manual-refund.service';
import { ManualRefundController } from './manual-refund.controller';

@Module({
  controllers: [ManualRefundController],
  providers: [ManualRefundService],
  exports: [ManualRefundService],
})
export class ManualRefundModule {}
