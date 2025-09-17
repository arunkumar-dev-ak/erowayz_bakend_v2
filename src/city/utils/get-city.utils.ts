import { Prisma } from '@prisma/client';
import { GetCityQueryDto } from '../dto/get-city.dto';

export function buildCityWhereFilter({
  query,
}: {
  query: GetCityQueryDto;
}): Prisma.ShopCityWhereInput {
  const where: Prisma.ShopCityWhereInput = {};

  const { name } = query;

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  return where;
}
