import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetDashboardBarChartQueryDto } from './dto/dashboard-bar-chart.dto';
import { GetDashboardBarChartUtils } from './utils/dashboard-bar-chart.utils';

@Injectable()
export class DashboardService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getDashboardCounts({ res }: { res: Response }) {
    const initialDate = new Date();

    const [totalCustomer, activeVendor, totalOrder, activeBanner] =
      await Promise.all([
        this.prismaService.user.count({
          where: {
            role: 'CUSTOMER',
          },
        }),
        this.prismaService.user.count({
          where: {
            role: 'VENDOR',
            status: true,
          },
        }),
        this.prismaService.order.count({
          where: {
            orderStatus: 'DELIVERED',
          },
        }),
        this.prismaService.banner.count({
          where: {
            bannerType: 'PRODUCT',
            status: 'ACTIVE',
            startDateTime: { lte: initialDate },
            endDateTime: { gte: initialDate },
          },
        }),
      ]);

    return this.responseService.successResponse({
      res,
      data: { totalCustomer, activeBanner, totalOrder, activeVendor },
      message: 'Dashboard data retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getBarcChartData({
    res,
    query,
  }: {
    res: Response;
    query: GetDashboardBarChartQueryDto;
  }) {
    const initialDate = new Date();

    const { orderWhere, bannerBookingWhere, serviceBookingWhere } =
      GetDashboardBarChartUtils({
        query,
      });

    const [orderCount, bannerBookingCount, serviceBookingCount] =
      await Promise.all([
        this.prismaService.order.count({
          where: orderWhere,
        }),
        this.prismaService.bannerBooking.count({
          where: bannerBookingWhere,
        }),
        this.prismaService.serviceBooking.count({
          where: serviceBookingWhere,
        }),
      ]);

    return this.responseService.successResponse({
      res,
      data: { orderCount, bannerBookingCount, serviceBookingCount },
      message: 'BarChart data retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
