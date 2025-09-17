import { Test, TestingModule } from '@nestjs/testing';
import { HomeApiService } from './home-api.service';

describe('HomeApiService', () => {
  let service: HomeApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeApiService],
    }).compile();

    service = module.get<HomeApiService>(HomeApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
