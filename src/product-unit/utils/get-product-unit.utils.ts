import { Prisma } from '@prisma/client';
import { GetProductUnitQueryDto } from '../dto/get-product-unit.dto';

export function buildProductUnitWhereFilter({
  query,
}: {
  query: GetProductUnitQueryDto;
}): Prisma.ProductUnitWhereInput {
  const where: Prisma.ProductUnitWhereInput = {};

  const { name } = query;

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  return where;
}
