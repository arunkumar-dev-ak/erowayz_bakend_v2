import { Test, TestingModule } from '@nestjs/testing';
import { VideoLinkController } from './video-link.controller';
import { VideoLinkService } from './video-link.service';

describe('VideoLinkController', () => {
  let controller: VideoLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoLinkController],
      providers: [VideoLinkService],
    }).compile();

    controller = module.get<VideoLinkController>(VideoLinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
