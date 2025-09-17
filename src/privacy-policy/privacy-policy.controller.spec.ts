import { Test, TestingModule } from '@nestjs/testing';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { PrivacyPolicyService } from './privacy-policy.service';

describe('PrivacyPolicyController', () => {
  let controller: PrivacyPolicyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivacyPolicyController],
      providers: [PrivacyPolicyService],
    }).compile();

    controller = module.get<PrivacyPolicyController>(PrivacyPolicyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
