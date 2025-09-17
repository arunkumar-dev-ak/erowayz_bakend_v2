import { Test, TestingModule } from '@nestjs/testing';
import { BloodDetailsController } from './blood-details.controller';
import { BloodDetailsService } from './blood-details.service';

describe('BloodDetailsController', () => {
  let controller: BloodDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloodDetailsController],
      providers: [BloodDetailsService],
    }).compile();

    controller = module.get<BloodDetailsController>(BloodDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
