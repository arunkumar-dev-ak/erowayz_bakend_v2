import { Test, TestingModule } from '@nestjs/testing';
import { BloodDetailsService } from './blood-details.service';

describe('BloodDetailsService', () => {
  let service: BloodDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BloodDetailsService],
    }).compile();

    service = module.get<BloodDetailsService>(BloodDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
