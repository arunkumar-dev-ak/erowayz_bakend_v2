import { Module } from '@nestjs/common';
import { PredefinedBannerService } from './predefined-banner.service';
import { PredefinedBannerController } from './predefined-banner.controller';

@Module({
  controllers: [PredefinedBannerController],
  providers: [PredefinedBannerService],
})
export class PredefinedBannerModule {}
