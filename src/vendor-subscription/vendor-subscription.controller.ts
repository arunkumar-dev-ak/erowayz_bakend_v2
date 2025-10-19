import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VendorSubscriptionService } from './vendor-subscription.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateVendorSubscriptionDto } from './dto/create-vendor-sub.dto';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { GetVendorSubscriptionQueryForAdmin } from './dto/get-vendor-sub.query.dto';

@ApiTags('vendor-subscription')
@Controller('vendor-subscription')
export class VendorSubscriptionController {
  constructor(
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {}

  @Roles(Role.VENDOR, Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('forAdmin')
  async getVendorSubscriptionForAdmin(
    @Query() query: GetVendorSubscriptionQueryForAdmin,
    @Res() res: Response,
  ) {
    await this.vendorSubscriptionService.getVendorSubscriptionForAdmin({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '0'),
    });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('currentVendorSubscription')
  async getCurrentVendorSubscription(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.vendorSubscriptionService.getVendorSubscriptionforVendor({
      res,
      vendorId,
    });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('currentAndFutureVendorSubscription')
  async getCurrentAndFutureVendorSubscription(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.vendorSubscriptionService.getCurrentAndFutureSubOfVendor({
      res,
      vendorId,
    });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('initiate')
  async initiateVendorSubscription(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateVendorSubscriptionDto,
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
  ) {
    const vendor = currentUser.vendor;
    if (!vendor) {
      throw new BadRequestException('vendor Not found');
    }
    await this.vendorSubscriptionService.initiateVendorSubscription({
      body,
      res,
      vendor,
      user: currentUser,
    });
  }
}
