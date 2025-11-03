import {
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
import { VendorServiceOptionService } from './vendor-service-option.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GetVendorServiceQueryDto } from './dto/get-vendor-service-query.dto';

@ApiTags('Vendor Service Options')
@Controller('vendor-service-option')
export class VendorServiceOptionController {
  constructor(
    private readonly vendorServiceOptionService: VendorServiceOptionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get launched services with pagination' })
  @ApiBearerAuth()
  async getServiceOption(
    @Res() res: Response,
    @Query() query: GetVendorServiceQueryDto,
  ) {
    return await this.vendorServiceOptionService.getServiceOptionForCustomer({
      query,
      res,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @Roles(Role.STAFF, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('serviceByVendorId')
  @ApiOperation({ summary: 'Get launched services with pagination' })
  @ApiBearerAuth()
  async getServiceByVendorId(
    @Req() req: Request,
    @Res() res: Response,
    @Query('offset') offset: string = '0',
    @Query('limit') limit: string = '10',
  ) {
    const offsetNum = Number(offset) || 0;
    const limitNum = Number(limit) || 10;
    const vendorId = extractVendorIdFromRequest(req);

    return await this.vendorServiceOptionService.getServiceOptionByVendor({
      vendorId,
      res,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  /*----- ServiceOption adding logic -----*/
  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('addServiceOption/:id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the serviceOption',
  })
  @ApiBearerAuth()
  async addServiceOption(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') serviceOptionId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.vendorServiceOptionService.addServiceOptionForVendor({
      vendorId,
      serviceOptionId,
      res,
    });
  }

  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('removeServiceOption/:id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the vendorServiceOption',
  })
  @ApiBearerAuth()
  async removeServiceOption(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') vendorServiceOptId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.vendorServiceOptionService.removeServiceOptionForVendor({
      vendorId,
      vendorServiceOptId,
      res,
    });
  }
}
