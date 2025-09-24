import { Prisma } from '@prisma/client';
import { GetShopCategoryQueryDto } from '../dto/get-shop-category.dto';

export function buildShopCategoryWhereFilter({
  query,
}: {
  query: GetShopCategoryQueryDto;
}): Prisma.ShopCategoryWhereInput {
  const where: Prisma.ShopCategoryWhereInput = {};

  const { name, status } = query;

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  if (status) {
    where.status = status;
  }

  return where;
}
