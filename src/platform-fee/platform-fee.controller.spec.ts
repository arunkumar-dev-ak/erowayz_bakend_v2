import { Test, TestingModule } from '@nestjs/testing';
import { PlatformFeeController } from './platform-fee.controller';
import { PlatformFeeService } from './platform-fee.service';

describe('PlatformFeeController', () => {
  let controller: PlatformFeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformFeeController],
      providers: [PlatformFeeService],
    }).compile();

    controller = module.get<PlatformFeeController>(PlatformFeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
