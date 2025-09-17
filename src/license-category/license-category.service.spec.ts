import { Test, TestingModule } from '@nestjs/testing';
import { LicenseCategoryService } from './license-category.service';

describe('LicenseCategoryService', () => {
  let service: LicenseCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenseCategoryService],
    }).compile();

    service = module.get<LicenseCategoryService>(LicenseCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
