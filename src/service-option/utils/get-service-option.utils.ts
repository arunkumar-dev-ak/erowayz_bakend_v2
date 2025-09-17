import { Prisma } from '@prisma/client';
import { GetServiceOptionQueryDto } from '../dto/get-service-option.dto';

export function buildServiceOptionWhereFilter({
  query,
}: {
  query: GetServiceOptionQueryDto;
}): Prisma.ServiceOptionWhereInput {
  const { name } = query;
  const where: Prisma.ServiceOptionWhereInput = {};

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  return where;
}
