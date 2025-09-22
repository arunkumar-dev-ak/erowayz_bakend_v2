import { Prisma } from '@prisma/client';
import { GetPosterLinkQueryDto } from '../dto/get-poster.dto';

export function buildPosterWhereFilter({
  query,
}: {
  query: GetPosterLinkQueryDto;
}): Prisma.PosterWhereInput {
  const where: Prisma.PosterWhereInput = {};

  const { heading } = query;

  if (heading) {
    where.heading = {
      contains: heading,
      mode: 'insensitive',
    };
  }

  return where;
}
