import { Test, TestingModule } from '@nestjs/testing';
import { HomeApiController } from './home-api.controller';
import { HomeApiService } from './home-api.service';

describe('HomeApiController', () => {
  let controller: HomeApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeApiController],
      providers: [HomeApiService],
    }).compile();

    controller = module.get<HomeApiController>(HomeApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
