import { forwardRef, Module } from '@nestjs/common';
import { EasebuzzService } from './easebuzz.service';
import { EasebuzzController } from './easebuzz.controller';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [forwardRef(() => QueueModule)],
  controllers: [EasebuzzController],
  providers: [EasebuzzService],
  exports: [EasebuzzService],
})
export class EasebuzzModule {}
