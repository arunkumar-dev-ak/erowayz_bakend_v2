import { Test, TestingModule } from '@nestjs/testing';
import { VendorTypeService } from './vendor-type.service';

describe('VendorTypeService', () => {
  let service: VendorTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorTypeService],
    }).compile();

    service = module.get<VendorTypeService>(VendorTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
