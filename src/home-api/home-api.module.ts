import { Module } from '@nestjs/common';
import { HomeApiService } from './home-api.service';
import { HomeApiController } from './home-api.controller';

@Module({
  controllers: [HomeApiController],
  providers: [HomeApiService],
})
export class HomeApiModule {}
