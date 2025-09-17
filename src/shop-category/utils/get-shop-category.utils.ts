import { Prisma } from '@prisma/client';
import { GetShopCategoryQueryDto } from '../dto/get-shop-category.dto';

export function buildShopCategoryWhereFilter({
  query,
}: {
  query: GetShopCategoryQueryDto;
}): Prisma.ShopCategoryWhereInput {
  const where: Prisma.ShopCategoryWhereInput = {};

  const { name } = query;

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  return where;
}
