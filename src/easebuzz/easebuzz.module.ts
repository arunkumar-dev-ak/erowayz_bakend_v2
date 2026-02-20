import { Module } from '@nestjs/common';
import { EasebuzzService } from './easebuzz.service';
import { EasebuzzController } from './easebuzz.controller';

@Module({
  controllers: [EasebuzzController],
  providers: [EasebuzzService],
  exports: [EasebuzzService],
})
export class EasebuzzModule {}
