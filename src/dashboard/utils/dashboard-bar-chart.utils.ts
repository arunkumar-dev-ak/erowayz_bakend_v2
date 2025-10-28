import { Prisma } from '@prisma/client';
import { GetDashboardBarChartQueryDto } from '../dto/dashboard-bar-chart.dto';
import { getIstTimeRange } from 'src/subscription/utils/get-sub-transaction.utils';

export const GetDashboardBarChartUtils = ({
  query,
}: {
  query: GetDashboardBarChartQueryDto;
}) => {
  const { startDate, endDate } = query;

  const { startIst } = getIstTimeRange(new Date(startDate));
  const { endIst } = getIstTimeRange(new Date(endDate));

  const orderWhere: Prisma.OrderWhereInput = {
    createdAt: {
      gte: startIst,
      lte: endIst,
    },
  };

  const serviceBookingWhere: Prisma.ServiceBookingWhereInput = {
    createdAt: {
      gte: startIst,
      lte: endIst,
    },
  };

  const bannerBookingWhere: Prisma.BannerBookingWhereInput = {
    createdAt: {
      gte: startIst,
      lte: endIst,
    },
  };

  return { serviceBookingWhere, orderWhere, bannerBookingWhere };
};
