import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOptionController } from './service-option.controller';
import { ServiceOptionService } from './service-option.service';

describe('ServiceOptionController', () => {
  let controller: ServiceOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOptionController],
      providers: [ServiceOptionService],
    }).compile();

    controller = module.get<ServiceOptionController>(ServiceOptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
