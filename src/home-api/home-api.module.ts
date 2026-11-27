import { Module } from '@nestjs/common';
import { HomeApiService } from './home-api.service';
import { HomeApiController } from './home-api.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [HomeApiController],
  providers: [HomeApiService],
  exports: [HomeApiService],
})
export class HomeApiModule {}
