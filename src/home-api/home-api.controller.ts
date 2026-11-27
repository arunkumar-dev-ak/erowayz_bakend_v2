import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HomeApiService } from './home-api.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { HomeApiDto } from './dto/home-api.dto';
import { GetVendorDashboardQueryDto } from './dto/get-vendor-dashboard-query.dto';
import { Roles } from '../common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorator/currentuser.decorator';
import { extractVendorIdFromRequest } from '../common/functions/extractVendorid';

@ApiTags('home-api')
@Controller('home-api')
export class HomeApiController {
  constructor(private readonly homeApiService: HomeApiService) {}

  // =========================================================================
  // NOTE: Legacy endpoint - NEED TO DELETE once mobile app fully migrates to unified-dashboard
  // =========================================================================
  @ApiOperation({
    summary: 'Retrieve Bar Chart information (Legacy - to be deleted)',
  })
  @Get('bar-chart/:vendorId')
  async getBarChart(
    @Res() res: Response,
    @Param('vendorId') vendorId: string,
    @Query() body: HomeApiDto,
  ) {
    return await this.homeApiService.getBarChartData({
      res,
      vendorId,
      body,
    });
  }

  // =========================================================================
  // Unified Vendor Home Dashboard Endpoint
  // Consolidates: Wallet, BarChart, Rating Summary, and Current Subscription
  // Supported for both Role.VENDOR and Role.STAFF
  // =========================================================================
  @ApiOperation({
    summary: 'Retrieve Unified Vendor Home Dashboard',
    description:
      'Consolidates Wallet balance, Order sales Bar Chart, Vendor Rating summary, and Active Subscription into a single parallel payload. Fully supported for both VENDOR and STAFF roles.',
  })
  @ApiBearerAuth()
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('vendor/dashboard')
  async getVendorDashboard(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetVendorDashboardQueryDto,
    @CurrentUser()
    currentUser: User & { vendor?: Vendor; staff?: Staff & { vendor: Vendor } },
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    const walletOwnerUserId =
      currentUser.staff?.vendor.userId ?? currentUser.id;
    const isStaff = currentUser.role === Role.STAFF;

    return await this.homeApiService.getVendorDashboard({
      vendorId,
      walletOwnerUserId,
      isStaff,
      query,
      res,
    });
  }

  // Alias endpoint: /home-api/dashboard
  @ApiOperation({
    summary: 'Retrieve Unified Vendor Home Dashboard (Alias)',
  })
  @ApiBearerAuth()
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('dashboard')
  async getDashboardAlias(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetVendorDashboardQueryDto,
    @CurrentUser()
    currentUser: User & { vendor?: Vendor; staff?: Staff & { vendor: Vendor } },
  ) {
    return this.getVendorDashboard(req, res, query, currentUser);
  }
}
