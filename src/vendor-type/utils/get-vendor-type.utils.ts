import { Prisma } from '@prisma/client';
import { GetVendorTypeQueryDto } from '../dto/get-vendor-type.dto';

export function buildVendorTypeWhereFilter({
  query,
}: {
  query: GetVendorTypeQueryDto;
}): Prisma.VendorTypeWhereInput {
  const { name, status } = query;
  const where: Prisma.VendorTypeWhereInput = {};

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
