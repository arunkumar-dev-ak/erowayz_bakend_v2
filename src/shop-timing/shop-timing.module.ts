import { Module } from '@nestjs/common';
import { ShopTimingService } from './shop-timing.service';
import { ShopTimingController } from './shop-timing.controller';
import { ShopInfoModule } from 'src/shop-info/shop-info.module';

@Module({
  imports: [ShopInfoModule],
  controllers: [ShopTimingController],
  providers: [ShopTimingService],
})
export class ShopTimingModule {}
