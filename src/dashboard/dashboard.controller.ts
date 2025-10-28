import { Controller, Get, Query, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Response } from 'express';
import { GetDashboardBarChartQueryDto } from './dto/dashboard-bar-chart.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Res() res: Response) {
    return await this.dashboardService.getDashboardCounts({
      res,
    });
  }

  @Get('barChart')
  async getBarChartData(
    @Res() res: Response,
    @Query() query: GetDashboardBarChartQueryDto,
  ) {
    return await this.dashboardService.getBarcChartData({
      res,
      query,
    });
  }
}
