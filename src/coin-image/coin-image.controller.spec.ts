import { Test, TestingModule } from '@nestjs/testing';
import { CoinImageController } from './coin-image.controller';
import { CoinImageService } from './coin-image.service';

describe('CoinImageController', () => {
  let controller: CoinImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinImageController],
      providers: [CoinImageService],
    }).compile();

    controller = module.get<CoinImageController>(CoinImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
