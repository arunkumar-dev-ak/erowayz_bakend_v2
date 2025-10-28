import { Global, Module } from '@nestjs/common';
import { ErrorLogService } from './error-log.service';
import { ErrorLogController } from './error-log.controller';

@Global()
@Module({
  providers: [ErrorLogService],
  exports: [ErrorLogService],
  controllers: [ErrorLogController],
})
export class ErrorLogModule {}
