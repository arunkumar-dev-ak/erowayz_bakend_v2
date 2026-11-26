import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { ResponseModule } from 'src/response/response.module';
import { TokenModule } from 'src/token/token.module';
import { StockAlertController } from './stock-alert.controller';
import { StockAlertGateway } from './stock-alert.gateway';
import { StockAlertService } from './stock-alert.service';

@Module({
  imports: [PrismaModule, RedisModule, ResponseModule, TokenModule],
  controllers: [StockAlertController],
  providers: [StockAlertService, StockAlertGateway],
  exports: [StockAlertService, StockAlertGateway],
})
export class StockAlertModule {}
