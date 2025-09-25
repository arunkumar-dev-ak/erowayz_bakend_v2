// utils/get-poster.utils.ts
import { Prisma } from '@prisma/client';
import { GetPosterLinkQueryDto } from '../dto/get-poster.dto';

export function buildPosterWhereFilter({
  query,
}: {
  query: GetPosterLinkQueryDto;
}): Prisma.PosterWhereInput {
  const where: Prisma.PosterWhereInput = {};

  const { heading, userType, vendorTypeId, vendorTypeName } = query;

  if (heading) {
    where.heading = {
      contains: heading,
      mode: 'insensitive',
    };
  }

  if (vendorTypeId) {
    where.vendorTypeId = vendorTypeId;
  }

  if (vendorTypeName) {
    where.vendorType = {
      name: {
        contains: vendorTypeName,
        mode: 'insensitive',
      },
    };
  }

  if (userType) {
    where.userType = userType;
  }

  return where;
}
