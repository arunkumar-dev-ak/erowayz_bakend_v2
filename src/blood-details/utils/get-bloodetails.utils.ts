import { Prisma } from '@prisma/client';
import { GetBloodDetailsQueryDto } from '../dto/get-blood-details-query.dto';

export function buildBloodDetailsWhereFilter({
  query,
}: {
  query: GetBloodDetailsQueryDto;
}): Prisma.BloodDetailsWhereInput {
  const where: Prisma.BloodDetailsWhereInput = {};

  const { userName, id, bloodGroup, isDonor } = query;

  if (userName) {
    where.User = {
      name: userName,
    };
  }
  if (id) where.id = id;
  if (bloodGroup) where.bloodGroup = bloodGroup;
  if (isDonor) where.isDonor = isDonor;

  return where;
}

export function includeBloodDetails(
  userId?: string,
): Prisma.BloodDetailsInclude | undefined {
  if (!userId) {
    return undefined;
  }

  return {
    User: {
      select: {
        bloodRequest: {
          where: {
            userId: userId,
            createdAt: {
              gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                bloodDetails: true,
                mobile: true,
              },
            },
          },
        },
      },
    },
  };
}
