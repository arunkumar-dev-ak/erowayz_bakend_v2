import { Global, Module } from '@nestjs/common';
import { AccountLifecycleController } from './account-lifecycle.controller';
import { AccountLifecycleService } from './account-lifecycle.service';

@Global()
@Module({
  controllers: [AccountLifecycleController],
  providers: [AccountLifecycleService],
  exports: [AccountLifecycleService],
})
export class AccountLifecycleModule {}
