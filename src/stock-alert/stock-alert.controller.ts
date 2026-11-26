import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request, Response } from 'express';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { GetStockAlertsQueryDto } from './dto/get-stock-alerts-query.dto';
import { StockAlertService } from './stock-alert.service';

@ApiTags('stock-alert')
@Controller('stock-alert')
export class StockAlertController {
  constructor(private readonly stockAlertService: StockAlertService) {}

  @ApiOperation({
    summary:
      'Get dedicated paginated stock alerts page for Vendor (low stock < 5 & out-of-stock)',
    description:
      'Returns all active items with remainingQty below STOCK_ALERT_LOW_THRESHOLD or OUT_OF_STOCK, auto-clearing once restocked.',
  })
  @Roles(Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('vendor')
  async getVendorStockAlerts(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetStockAlertsQueryDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.stockAlertService.getVendorStockAlertsPage({
      vendorId,
      query,
      res,
    });
  }
}
