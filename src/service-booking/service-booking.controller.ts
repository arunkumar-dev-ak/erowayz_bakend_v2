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
import { ServiceBookingService } from './service-booking.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Request, Response } from 'express';
import { GetServiceBookingQueryDto } from './dto/get-service-booking-query.dto';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';
import { ChangeBookingStatusDto } from './dto/service-booking-status.dto';
import { GetAdminServiceBookingQueryDto } from './dto/service-booking-admin.dto';

@Controller('service-booking')
export class ServiceBookingController {
  constructor(private readonly serviceBookingService: ServiceBookingService) {}

  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('customer')
  @ApiOperation({ summary: 'Get service bookings for customer' })
  async getServiceBookingForCustomer(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetServiceBookingQueryDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '0');
    await this.serviceBookingService.getServiceBookingForUser({
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
  @ApiOperation({ summary: 'Get service bookings for vendor' })
  async getServiceBookingForVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetServiceBookingQueryDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '0');
    await this.serviceBookingService.getServiceBookingForVendor({
      res,
      vendorId,
      query,
      limit,
      offset,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  @ApiOperation({ summary: 'Get banner booking by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  async getBannerBookingForAdmin(
    @Query() query: GetAdminServiceBookingQueryDto,
    @Res() res: Response,
  ) {
    await this.serviceBookingService.getServiceBookingForAdmin({
      res,
      query,
      offset: Number(query.offset ?? '0'),
      limit: Number(query.limit ?? '0'),
    });
  }

  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('bookingById/:id')
  @ApiOperation({ summary: 'Get service booking by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  async getServiceBookingById(
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
    @Res() res: Response,
    @Param('id') bookingId: string,
  ) {
    await this.serviceBookingService.getServiceBookingById({
      res,
      bookingId,
      userId: currentUser.id,
      vendorId: currentUser.vendor?.id,
    });
  }

  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create service booking' })
  @ApiBody({ type: CreateServiceBookingDto })
  async createBannerBooking(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateServiceBookingDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    await this.serviceBookingService.createServiceBooking({
      res,
      userId,
      body,
    });
  }

  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Put('changeStatus/:id')
  @ApiOperation({ summary: 'Change service booking status' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  @ApiBody({ type: ChangeBookingStatusDto })
  async changeStatus(
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
    @Res() res: Response,
    @Body() body: ChangeBookingStatusDto,
    @Param('id') bookingId: string,
  ) {
    await this.serviceBookingService.changeStatus({
      res,
      currentUser,
      body,
      bookingId,
    });
  }
}
