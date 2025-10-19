import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BannerBookingService } from './banner-booking.service';
import { Request, Response } from 'express';
import { GetBannerBookingQueryDto } from './dto/get-banner-booking-query.dto';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { CreateBannerBookingDto } from './dto/create-banner-booking.dto';
import { ChangeBannerBookingStatusDto } from './dto/banner-booking-status.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetAdminBannnerBookingQueryDto } from './dto/banner-booking-admin.dto';

@ApiTags('Banner Booking')
@Controller('banner-booking')
export class BannerBookingController {
  constructor(private readonly bannerBookingService: BannerBookingService) {}

  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('customer')
  @ApiOperation({ summary: 'Get banner bookings for customer' })
  async getBannerBookingForCustomer(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetBannerBookingQueryDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '0');
    await this.bannerBookingService.getBannerBookingForUser({
      res,
      userId,
      query,
      limit,
      offset,
    });
  }

  @Roles(Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('vendor')
  @ApiOperation({ summary: 'Get banner bookings for vendor' })
  async getBannerBookingForVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetBannerBookingQueryDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '0');
    await this.bannerBookingService.getBannerBookingForVendor({
      res,
      vendorId,
      query,
      limit,
      offset,
    });
  }

  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('bookingById/:id')
  @ApiOperation({ summary: 'Get banner booking by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  async getBannerBookingById(
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
    @Res() res: Response,
    @Param('id') bookingId: string,
  ) {
    await this.bannerBookingService.getBannerBookingById({
      res,
      bookingId,
      userId: currentUser.id,
      vendorId: currentUser.vendor?.id,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  @ApiOperation({ summary: 'Get banner booking by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  async getBannerBookingForAdmin(
    @Query() query: GetAdminBannnerBookingQueryDto,
    @Res() res: Response,
  ) {
    await this.bannerBookingService.getBannerBookingForAdmin({
      res,
      query,
      offset: Number(query.offset ?? '0'),
      limit: Number(query.limit ?? '0'),
    });
  }

  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create banner booking' })
  @ApiBody({ type: CreateBannerBookingDto })
  async createBannerBooking(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateBannerBookingDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    await this.bannerBookingService.createBannerBooking({
      res,
      userId,
      body,
    });
  }

  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Put('changeStatus/:id')
  @ApiOperation({ summary: 'Change banner booking status' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  @ApiBody({ type: ChangeBannerBookingStatusDto })
  async changeStatus(
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
    @Res() res: Response,
    @Body() body: ChangeBannerBookingStatusDto,
    @Param('id') bookingId: string,
  ) {
    await this.bannerBookingService.changeStatus({
      res,
      currentUser,
      body,
      bookingId,
    });
  }
}
