import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [CronjobsService],
})
export class CronjobsModule {}
