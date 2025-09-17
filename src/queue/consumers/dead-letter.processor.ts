import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('deadLetter')
export class DeadLetterProcessor {
  @Process('dead-letter-job')
  handleFailedData(job: Job) {
    console.warn('DLQ Job received:', job.data);
    // Save to DB, send Slack alert, or trigger retry, etc.
  }
}
