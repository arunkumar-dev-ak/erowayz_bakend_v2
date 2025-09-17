import { BadRequestException } from '@nestjs/common';
import { UpdateShopCategoryDto } from '../dto/update-shop-category.dto';
import { Prisma } from '@prisma/client';
import { ShopCategoryService } from '../shop-category.service';

export const UpdateShopCategoryUtils = async ({
  body,
  shopCategoryService,
  shopCategoryId,
}: {
  body: UpdateShopCategoryDto;
  shopCategoryService: ShopCategoryService;
  shopCategoryId: string;
}) => {
  const { name, status } = body;

  const existingShopCategory =
    await shopCategoryService.getShopCategoryById(shopCategoryId);
  if (!existingShopCategory) {
    throw new BadRequestException('ShopCategory not found');
  }

  if (name) {
    const existingShopCategory =
      await shopCategoryService.getShopCategoryByName(name);
    if (existingShopCategory && existingShopCategory.id !== shopCategoryId) {
      throw new BadRequestException(`Name already exists`);
    }

    const shopCategoryInLicense =
      await shopCategoryService.checkShopCategoryHasShop(shopCategoryId);
    if (shopCategoryInLicense) {
      throw new BadRequestException('Vendor utilised in shop.Cant update name');
    }
  }

  const updateQuery: Prisma.ShopCategoryUpdateInput = {};

  if (name !== undefined) {
    updateQuery.name = name;
  }

  if (status !== undefined) {
    updateQuery.status = status;
  }

  return { updateQuery };
};
