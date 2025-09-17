import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ItemModule } from 'src/item/item.module';
import { BannerModule } from 'src/banner/banner.module';
import { VendorServiceOptionModule } from 'src/vendor-service-option/vendor-service-option.module';
import { CartModule } from 'src/cart/cart.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { OrderGatewayModule } from 'src/order-gateway/order-gateway.module';
import { PaymentModule } from 'src/payment/payment.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    ItemModule,
    BannerModule,
    VendorServiceOptionModule,
    CartModule,
    VendorModule,
    OrderGatewayModule,
    PaymentModule,
    WalletModule,
    PaymentModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [
    ItemModule,
    BannerModule,
    VendorServiceOptionModule,
    CartModule,
    VendorModule,
    OrderGatewayModule,
    OrderService,
    PaymentModule,
  ],
})
export class OrderModule {}
