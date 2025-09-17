import { Module } from '@nestjs/common';
import { OrderGatewayService } from './order-gateway.service';
import { OrderGateway } from './order-gateway.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [OrderGatewayService, OrderGateway],
  exports: [OrderGateway],
})
export class OrderGatewayModule {}
