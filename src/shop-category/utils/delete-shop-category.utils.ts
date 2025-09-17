import { BadRequestException } from '@nestjs/common';
import { ShopCategoryService } from '../shop-category.service';

export const DeleteShopCategoryUtils = async ({
  shopCategoryId,
  shopCategoryService,
}: {
  shopCategoryId: string;
  shopCategoryService: ShopCategoryService;
}) => {
  const existingShopCategory =
    await shopCategoryService.getShopCategoryById(shopCategoryId);
  if (!existingShopCategory) {
    throw new BadRequestException('ShopCategory not found');
  }

  const shopCategoryWithLicense =
    await shopCategoryService.checkShopCategoryHasShop(shopCategoryId);
  if (shopCategoryWithLicense) {
    throw new BadRequestException('Shop Category has shops.You cannot delete');
  }
};
