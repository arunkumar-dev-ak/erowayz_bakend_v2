import { Prisma } from '@prisma/client';
import { GetVideoQueryDto } from '../dto/get-video-link.dto';

export function buildVideoLinkWhereFilter({
  query,
}: {
  query: GetVideoQueryDto;
}): Prisma.VideoLinkWhereInput {
  const where: Prisma.VideoLinkWhereInput = {};

  const { heading } = query;

  if (heading) {
    where.heading = {
      contains: heading,
      mode: 'insensitive',
    };
  }

  return where;
}
