import { Module } from '@nestjs/common';
import { DynamicFieldService } from './dynamic-field.service';
import { DynamicFieldController } from './dynamic-field.controller';

@Module({
  controllers: [DynamicFieldController],
  providers: [DynamicFieldService],
})
export class DynamicFieldModule {}
