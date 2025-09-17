import { Module } from '@nestjs/common';
import { DisclaimerService } from './disclaimer.service';
import { DisclaimerController } from './disclaimer.controller';

@Module({
  controllers: [DisclaimerController],
  providers: [DisclaimerService],
})
export class DisclaimerModule {}
