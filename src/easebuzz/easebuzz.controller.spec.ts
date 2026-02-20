import { Test, TestingModule } from '@nestjs/testing';
import { EasebuzzController } from './easebuzz.controller';
import { EasebuzzService } from './easebuzz.service';

describe('EasebuzzController', () => {
  let controller: EasebuzzController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EasebuzzController],
      providers: [EasebuzzService],
    }).compile();

    controller = module.get<EasebuzzController>(EasebuzzController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
