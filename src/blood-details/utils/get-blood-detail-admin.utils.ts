import { Prisma } from '@prisma/client';
import { GetAdminBloodDetailQueryDto } from '../dto/get-blood-detail-admin.dto';
import { getDayRange } from 'src/common/functions/utils';

export const GetBloodDetailAdminUtils = ({
  query,
}: {
  query: GetAdminBloodDetailQueryDto;
}) => {
  const { startDate, endDate, requesterName, donorName } = query;

  const where: Prisma.BloodRequestWhereInput = {};

  if (requesterName) {
    where.user = {
      name: {
        contains: requesterName,
        mode: 'insensitive',
      },
    };
  }

  if (donorName) {
    where.donor = {
      name: {
        contains: donorName,
        mode: 'insensitive',
      },
    };
  }

  if (startDate && endDate) {
    const { start } = getDayRange(new Date(startDate));
    const { end } = getDayRange(new Date(endDate));

    where.createdAt = {
      gte: start,
      lte: end,
    };
  }

  return { where };
};
