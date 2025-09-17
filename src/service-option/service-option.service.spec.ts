import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOptionService } from './service-option.service';

describe('ServiceOptionService', () => {
  let service: ServiceOptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceOptionService],
    }).compile();

    service = module.get<ServiceOptionService>(ServiceOptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
