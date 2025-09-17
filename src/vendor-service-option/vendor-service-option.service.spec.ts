import { Test, TestingModule } from '@nestjs/testing';
import { VendorServiceOptionService } from './vendor-service-option.service';

describe('VendorServiceOptionService', () => {
  let service: VendorServiceOptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorServiceOptionService],
    }).compile();

    service = module.get<VendorServiceOptionService>(
      VendorServiceOptionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
