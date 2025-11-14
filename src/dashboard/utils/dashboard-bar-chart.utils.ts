import { Prisma } from '@prisma/client';
import { GetDashboardBarChartQueryDto } from '../dto/dashboard-bar-chart.dto';
import { getUtcTimeRangeForIstRange } from 'src/coins-settlement/utils/get-coins-settlement.utils';

export const GetDashboardBarChartUtils = ({
  query,
}: {
  query: GetDashboardBarChartQueryDto;
}) => {
  const { startDate, endDate } = query;

  const { startIst } = getUtcTimeRangeForIstRange(new Date(startDate));
  const { endIst } = getUtcTimeRangeForIstRange(new Date(endDate));

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
