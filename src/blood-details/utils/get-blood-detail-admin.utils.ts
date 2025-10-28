import { Prisma } from '@prisma/client';
import { getIstTimeRange } from 'src/subscription/utils/get-sub-transaction.utils';
import { GetAdminBloodDetailQueryDto } from '../dto/get-blood-detail-admin.dto';

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
    const { startIst } = getIstTimeRange(new Date(startDate));
    const { endIst } = getIstTimeRange(new Date(endDate));

    where.createdAt = {
      gte: startIst,
      lte: endIst,
    };
  }

  return { where };
};
