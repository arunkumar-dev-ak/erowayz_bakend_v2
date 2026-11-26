import { Global, Module } from '@nestjs/common';
import { AccountLifecycleService } from './account-lifecycle.service';

@Global()
@Module({
  providers: [AccountLifecycleService],
  exports: [AccountLifecycleService],
})
export class AccountLifecycleModule {}
