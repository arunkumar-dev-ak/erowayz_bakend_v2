import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FavouriteService } from './favourite.service';
import { CreateFavouriteVendorForCustomerDto } from './dto/create-favourite-vendor.dto';
import { CreateFavouriteCustomerForVendorDto } from './dto/create-favourite-customer.dto';
import { GetFavouriteVendorQueryDto } from './dto/get-favourite-vendor-query.dto';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { GetFavouriteCustomerQueryDto } from './dto/get-favourite-customer-query.dto';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';

@ApiTags('favourite')
@Controller('favourite')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  // -------------------- CUSTOMER FAVOURITES --------------------

  @ApiOperation({ summary: 'Get favourite vendors for a customer' })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('customer')
  async getFavouriteVendorsForCustomer(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetFavouriteVendorQueryDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    await this.favouriteService.getFavouriteVendorForCustomer({
      res,
      query,
      userId,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @ApiOperation({ summary: 'Create favourite vendor for a customer' })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('customer/create')
  async createFavouriteVendorForCustomer(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateFavouriteVendorForCustomerDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    await this.favouriteService.createFavouriteVendorForCustomer({
      res,
      body,
      userId,
    });
  }

  @ApiOperation({ summary: 'Remove favourite vendor for a customer' })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'favouriteId', description: 'Favourite vendor ID' })
  @Delete('customer/remove/:favouriteId')
  async removeFavouriteVendorForCustomer(
    @Req() req: Request,
    @Res() res: Response,
    @Param('favouriteId') favouriteId: string,
  ) {
    const userId = extractUserIdFromRequest(req);
    await this.favouriteService.removeFavouriteVendorForCustomer({
      res,
      userId,
      favouriteId,
    });
  }

  /* -------------------- VENDOR FAVOURITES -------------------- */

  @ApiOperation({ summary: 'Get favourite customers for a vendor' })
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('vendor')
  async getFavouriteCustomersForVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetFavouriteCustomerQueryDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.favouriteService.getFavouriteCustomerForVendor({
      res,
      query,
      vendorId,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @ApiOperation({ summary: 'Create favourite customer for a vendor' })
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('vendor/create')
  async createFavouriteCustomerForVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateFavouriteCustomerForVendorDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.favouriteService.createFavouriteCustomerForVendor({
      res,
      body,
      vendorId,
    });
  }

  @ApiOperation({ summary: 'Remove favourite customer for a vendor' })
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'favouriteId', description: 'Favourite customer ID' })
  @Delete('vendor/remove/:favouriteId')
  async removeFavouriteCustomerForVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Param('favouriteId') favouriteId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.favouriteService.removeFavouriteCustomerForVendor({
      res,
      vendorId,
      favouriteId,
    });
  }
}
