import { Test, TestingModule } from '@nestjs/testing';
import { ShopCategoryService } from './shop-category.service';

describe('ShopCategoryService', () => {
  let service: ShopCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopCategoryService],
    }).compile();

    service = module.get<ShopCategoryService>(ShopCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
