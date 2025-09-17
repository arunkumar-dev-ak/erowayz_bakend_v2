import { Module } from '@nestjs/common';
import { VideoLinkService } from './video-link.service';
import { VideoLinkController } from './video-link.controller';

@Module({
  controllers: [VideoLinkController],
  providers: [VideoLinkService],
})
export class VideoLinkModule {}
