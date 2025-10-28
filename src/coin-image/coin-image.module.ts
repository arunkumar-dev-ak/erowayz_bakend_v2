import { Module } from '@nestjs/common';
import { CoinImageService } from './coin-image.service';
import { CoinImageController } from './coin-image.controller';

@Module({
  controllers: [CoinImageController],
  providers: [CoinImageService],
})
export class CoinImageModule {}
