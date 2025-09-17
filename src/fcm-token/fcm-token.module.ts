import { Module } from '@nestjs/common';
import { FcmTokenService } from './fcm-token.service';

@Module({
  providers: [FcmTokenService],
  exports: [FcmTokenService],
})
export class FcmTokenModule {}
