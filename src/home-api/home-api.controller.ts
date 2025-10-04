import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { HomeApiService } from './home-api.service';
import { ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { HomeApiDto } from './dto/home-api.dto';

@Controller('home-api')
export class HomeApiController {
  constructor(private readonly homeApiService: HomeApiService) {}

  @ApiOperation({
    summary: 'Retrieve Bar Chart information',
  })
  @Get('bar-chart/:vendorId')
  async getBarChart(
    @Res() res: Response,
    @Param('vendorId') vendorId: string,
    @Query() body: HomeApiDto,
  ) {
    console.log('vendorId');
    return await this.homeApiService.getBarChartData({
      res,
      vendorId,
      body,
    });
  }
}
