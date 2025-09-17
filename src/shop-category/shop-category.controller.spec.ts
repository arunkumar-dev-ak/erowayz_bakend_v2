import { Test, TestingModule } from '@nestjs/testing';
import { ShopCategoryController } from './shop-category.controller';
import { ShopCategoryService } from './shop-category.service';

describe('ShopCategoryController', () => {
  let controller: ShopCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopCategoryController],
      providers: [ShopCategoryService],
    }).compile();

    controller = module.get<ShopCategoryController>(ShopCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
