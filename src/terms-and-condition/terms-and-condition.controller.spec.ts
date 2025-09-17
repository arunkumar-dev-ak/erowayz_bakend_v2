import { Test, TestingModule } from '@nestjs/testing';
import { TermsAndConditionController } from './terms-and-condition.controller';
import { TermsAndConditionService } from './terms-and-condition.service';

describe('TermsAndConditionController', () => {
  let controller: TermsAndConditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermsAndConditionController],
      providers: [TermsAndConditionService],
    }).compile();

    controller = module.get<TermsAndConditionController>(TermsAndConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
