import { Test, TestingModule } from '@nestjs/testing';
import { LicenseCategoryController } from './license-category.controller';
import { LicenseCategoryService } from './license-category.service';

describe('LicenseCategoryController', () => {
  let controller: LicenseCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenseCategoryController],
      providers: [LicenseCategoryService],
    }).compile();

    controller = module.get<LicenseCategoryController>(LicenseCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
