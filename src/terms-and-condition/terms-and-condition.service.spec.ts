import { Test, TestingModule } from '@nestjs/testing';
import { TermsAndConditionService } from './terms-and-condition.service';

describe('TermsAndConditionService', () => {
  let service: TermsAndConditionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TermsAndConditionService],
    }).compile();

    service = module.get<TermsAndConditionService>(TermsAndConditionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
