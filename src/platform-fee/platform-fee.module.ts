import { Module } from '@nestjs/common';
import { PlatformFeeService } from './platform-fee.service';
import { PlatformFeeController } from './platform-fee.controller';

@Module({
  controllers: [PlatformFeeController],
  providers: [PlatformFeeService],
  exports: [PlatformFeeService],
})
export class PlatformFeeModule {}
