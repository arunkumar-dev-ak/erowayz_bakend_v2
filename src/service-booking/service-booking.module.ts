import { Module } from '@nestjs/common';
import { ServiceBookingService } from './service-booking.service';
import { ServiceBookingController } from './service-booking.controller';
import { ServiceBookingGateway } from './service-booking.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { VendorServiceModule } from 'src/vendor-service/vendor-service.module';

@Module({
  imports: [VendorServiceModule, RedisModule, ConfigModule],
  controllers: [ServiceBookingController],
  providers: [ServiceBookingService, ServiceBookingGateway],
})
export class ServiceBookingModule {}
