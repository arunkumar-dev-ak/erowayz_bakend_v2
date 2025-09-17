import { Module } from '@nestjs/common';
import { BloodDetailsService } from './blood-details.service';
import { BloodDetailsController } from './blood-details.controller';

@Module({
  controllers: [BloodDetailsController],
  providers: [BloodDetailsService],
  exports: [BloodDetailsService],
})
export class BloodDetailsModule {}
