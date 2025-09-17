import { forwardRef, Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { UserModule } from 'src/user/user.module';
import { ConfigService } from '@nestjs/config';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [UserModule, forwardRef(() => PaymentModule)],
  controllers: [WalletController],
  providers: [WalletService, ConfigService],
  exports: [WalletService, UserModule],
})
export class WalletModule {}
