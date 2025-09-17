import { Test, TestingModule } from '@nestjs/testing';
import { DynamicFieldService } from './dynamic-field.service';

describe('DynamicFieldService', () => {
  let service: DynamicFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamicFieldService],
    }).compile();

    service = module.get<DynamicFieldService>(DynamicFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
