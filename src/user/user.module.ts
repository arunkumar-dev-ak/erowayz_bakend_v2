import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BloodDetailsModule } from 'src/blood-details/blood-details.module';

@Global()
@Module({
  imports: [BloodDetailsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, BloodDetailsModule],
})
export class UserModule {}
