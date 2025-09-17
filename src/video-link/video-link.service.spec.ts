import { Test, TestingModule } from '@nestjs/testing';
import { VideoLinkService } from './video-link.service';

describe('VideoLinkService', () => {
  let service: VideoLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoLinkService],
    }).compile();

    service = module.get<VideoLinkService>(VideoLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
