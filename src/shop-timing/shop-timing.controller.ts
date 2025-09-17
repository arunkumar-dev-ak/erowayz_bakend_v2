import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ShopTimingService } from './shop-timing.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { ShopTimingDto } from './dto/shop-timing.dto';
import { UpdateShopTimingUtils } from './utils/update-shop-timing.utils';

@ApiTags('Shop Timing')
@Controller('shop-timing')
export class ShopTimingController {
  constructor(private readonly shopTimingService: ShopTimingService) {}

  @Get('getForCustomer/:vendorId')
  @ApiParam({
    name: 'vendorId',
    type: String,
    description: 'Vendor ID',
  })
  async getShopTimingByCustomer(
    @Res() res: Response,
    @Param('vendorId') vendorId: string,
  ) {
    await this.shopTimingService.getShopTimingByVendor({ res, vendorId });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('getByVendor')
  async getShopTimingByVendor(@Req() req: Request, @Res() res: Response) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.shopTimingService.getShopTimingByVendor({ res, vendorId });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiBody({ type: ShopTimingDto })
  async createShopTiming(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ShopTimingDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.shopTimingService.createShopTiming({ res, vendorId, body });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Patch('updateStatus/:shopTimingId')
  @ApiParam({
    name: 'shopTimingId',
    type: String,
    description: 'ShopTiming ID',
  })
  @ApiBody({ type: UpdateShopTimingUtils })
  async updateShopTimingStatus(
    @Param('shopTimingId') shopTimingId: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateShopTimingUtils,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.shopTimingService.updateShopTimingStatus({
      res,
      shopTimingId,
      vendorId,
      body,
    });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Delete('delete')
  async deleteShopTiming(@Req() req: Request, @Res() res: Response) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.shopTimingService.deleteShopTiming({ res, vendorId });
  }
}
