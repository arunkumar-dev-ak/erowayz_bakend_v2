import { Module } from '@nestjs/common';
import { ShopInfoService } from './shop-info.service';
import { ShopInfoController } from './shop-info.controller';

@Module({
  controllers: [ShopInfoController],
  providers: [ShopInfoService],
  exports: [ShopInfoService],
})
export class ShopInfoModule {}
