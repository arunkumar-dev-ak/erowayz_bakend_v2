import { Module } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { FavouriteController } from './favourite.controller';
import { OrderModule } from 'src/order/order.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [OrderModule, VendorModule, UserModule],
  controllers: [FavouriteController],
  providers: [FavouriteService],
})
export class FavouriteModule {}
