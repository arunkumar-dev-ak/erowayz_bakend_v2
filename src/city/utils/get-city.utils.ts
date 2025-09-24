import { Prisma } from '@prisma/client';
import { GetCityQueryDto } from '../dto/get-city.dto';

export function buildCityWhereFilter({
  query,
}: {
  query: GetCityQueryDto;
}): Prisma.ShopCityWhereInput {
  const where: Prisma.ShopCityWhereInput = {};

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
