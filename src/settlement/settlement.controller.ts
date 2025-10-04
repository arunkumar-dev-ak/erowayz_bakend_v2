import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Request, Response } from 'express';
import { AdminSettlementQueryDto } from './dto/admin-settlement.dto';
import { GetAdminIndividulaSettlementQueryDto } from './dto/admin-order-ind-settlement';

@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get('admin/order')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async getAllVendorsForAdmin(
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

  @Get('settlement/individualOrderSettlement')
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
