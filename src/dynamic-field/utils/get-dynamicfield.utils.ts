import { Prisma } from '@prisma/client';
import { GetDynamicFieldQueryDto } from '../dto/get-dynamic-field-query.dto';

export function buildDynamicFieldWhereFilter({
  query,
}: {
  query: GetDynamicFieldQueryDto;
}): Prisma.DynamicFieldWhereInput {
  const where: Prisma.DynamicFieldWhereInput = {};

  const { label, context, status, id } = query;

  if (label) {
    where.label = {
      equals: label,
      mode: 'insensitive',
    };
  }
  if (context) where.context = context;
  if (status) where.status = status;
  if (id) where.id = id;

  return where;
}
