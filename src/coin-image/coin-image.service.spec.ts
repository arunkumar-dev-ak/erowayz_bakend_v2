import { Test, TestingModule } from '@nestjs/testing';
import { CoinImageService } from './coin-image.service';

describe('CoinImageService', () => {
  let service: CoinImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinImageService],
    }).compile();

    service = module.get<CoinImageService>(CoinImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
