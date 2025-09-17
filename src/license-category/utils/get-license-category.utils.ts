import { Prisma } from '@prisma/client';
import { GetLicenseCategoryQueryDto } from '../dto/get-license-category.dto';

export function buildLicenseCategoryWhereFilter({
  query,
}: {
  query: GetLicenseCategoryQueryDto;
}): Prisma.LicenseCategoryWhereInput {
  const where: Prisma.LicenseCategoryWhereInput = {};

  const { name } = query;

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  return where;
}
