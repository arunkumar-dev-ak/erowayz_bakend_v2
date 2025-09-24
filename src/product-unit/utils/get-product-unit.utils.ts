import { Prisma } from '@prisma/client';
import { GetProductUnitQueryDto } from '../dto/get-product-unit.dto';

export function buildProductUnitWhereFilter({
  query,
}: {
  query: GetProductUnitQueryDto;
}): Prisma.ProductUnitWhereInput {
  const where: Prisma.ProductUnitWhereInput = {};

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
