import { Module } from '@nestjs/common';
import { BannerBookingService } from './banner-booking.service';
import { BannerBookingController } from './banner-booking.controller';
import { BannerModule } from 'src/banner/banner.module';
import { BannerBookingGateway } from './banner-booking.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [BannerModule, RedisModule, ConfigModule],
  controllers: [BannerBookingController],
  providers: [BannerBookingService, BannerBookingGateway],
})
export class BannerBookingModule {}
