import { Prisma, Status } from '@prisma/client';
import { GetBannerStatus } from '../dto/predefined-banner-query.dto';

export function buildPreDefinedWhereFilter({
  name,
  status,
}: {
  name?: string;
  status?: GetBannerStatus;
}): Prisma.PreDefinedBannerWhereInput {
  const where: Prisma.PreDefinedBannerWhereInput = {};

  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }
  if (status && status !== GetBannerStatus.ALL) {
    where.status = status;
  } else if (!status) {
    where.status = Status.ACTIVE;
  }

  return where;
}
