import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Request, Response } from 'express';
import { AdminSettlementQueryDto } from './dto/admin-settlement.dto';
import { GetAdminIndividulaSettlementQueryDto } from './dto/admin-order-ind-settlement';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { VendorOrderSettlementQueryDto } from './dto/vendor-order-settlement';

@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get('admin/order')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async getSettlementForAdmin(
    @Res() res: Response,
    @Query() query: AdminSettlementQueryDto,
  ) {
    await this.settlementService.getOrderSettlementForAdmin({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '0'),
    });
  }

  @Get('vendor/order')
  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  async getSettlementForVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: VendorOrderSettlementQueryDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.settlementService.getOrderSettlementForVendor({
      vendorId,
      res,
      month: Number(query.month),
      year: Number(query.year),
    });
  }

  @Get('individualOrderSettlement')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async getIndivdualOrderSettlement(
    @Res() res: Response,
    @Query() query: GetAdminIndividulaSettlementQueryDto,
  ) {
    await this.settlementService.getIndividualOrderSettlementForAdmin({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '0'),
    });
  }
}
