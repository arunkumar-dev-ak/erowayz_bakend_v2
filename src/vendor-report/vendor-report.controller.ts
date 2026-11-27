import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request, Response } from 'express';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { CreateVendorReportDto } from './dto/create-vendor-report.dto';
import { GetAdminVendorReportQueryDto } from './dto/get-admin-vendor-report-query.dto';
import { UpdateVendorReportStatusDto } from './dto/update-vendor-report-status.dto';
import { VendorReportService } from './vendor-report.service';

@ApiTags('vendor-report')
@Controller('vendor-report')
export class VendorReportController {
  constructor(private readonly vendorReportService: VendorReportService) {}

  @ApiOperation({
    summary: 'Submit an inline vendor dispute/concern report for an Order or Booking',
    description:
      'Allows authenticated vendors or staff to submit one text-only concern against an Order or Booking (e.g., customer refused COD payment). Hidden from customer.',
  })
  @ApiBody({ type: CreateVendorReportDto })
  @Roles(Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  async createReport(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateVendorReportDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.vendorReportService.createReport({
      vendorId,
      body,
      res,
    });
  }

  @ApiOperation({
    summary: 'Get paginated vendor reports (Admin / Subadmin)',
    description:
      'Admin Vendor Concerns & Disputes Dashboard listing reports filterable by status, targetType (ORDER or BOOKING), and search query.',
  })
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  async getAllReportsAdmin(
    @Query() query: GetAdminVendorReportQueryDto,
    @Res() res: Response,
  ) {
    return await this.vendorReportService.getAllReportsAdmin({
      query,
      res,
    });
  }

  @ApiOperation({
    summary:
      'Update vendor report resolution status & notify vendor (Admin / Subadmin)',
    description:
      'Updates report status (VIEWED, ACCEPTED, DECLINED, RESOLVED) and triggers Firebase push notification to the vendor.',
  })
  @ApiParam({ name: 'id', description: 'VendorReport UUID' })
  @ApiBody({ type: UpdateVendorReportStatusDto })
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('admin/:id/status')
  async updateReportStatus(
    @Param('id') reportId: string,
    @Body() body: UpdateVendorReportStatusDto,
    @Res() res: Response,
  ) {
    return await this.vendorReportService.updateReportStatus({
      reportId,
      body,
      res,
    });
  }
}
