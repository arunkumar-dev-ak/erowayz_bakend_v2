import { Test, TestingModule } from '@nestjs/testing';
import { DynamicFieldController } from './dynamic-field.controller';
import { DynamicFieldService } from './dynamic-field.service';

describe('DynamicFieldController', () => {
  let controller: DynamicFieldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DynamicFieldController],
      providers: [DynamicFieldService],
    }).compile();

    controller = module.get<DynamicFieldController>(DynamicFieldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
