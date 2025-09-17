import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { FcmTokenModule } from 'src/fcm-token/fcm-token.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [FcmTokenModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, ConfigService],
})
export class AuthModule {}
