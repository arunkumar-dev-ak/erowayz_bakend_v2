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
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { CreateCustomerReportDto } from './dto/create-customer-report.dto';
import { GetAdminCustomerReportQueryDto } from './dto/get-admin-customer-report-query.dto';
import { UpdateCustomerReportStatusDto } from './dto/update-customer-report-status.dto';
import { CustomerReportService } from './customer-report.service';

@ApiTags('customer-report')
@Controller('customer-report')
export class CustomerReportController {
  constructor(private readonly customerReportService: CustomerReportService) {}

  @ApiOperation({
    summary: 'Submit an inline customer report for an Order or Booking',
    description:
      'Allows authenticated customers to submit one text-only concern against their own Order or Booking across any status.',
  })
  @ApiBody({ type: CreateCustomerReportDto })
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  async createReport(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateCustomerReportDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    return await this.customerReportService.createReport({
      userId,
      body,
      res,
    });
  }

  @ApiOperation({
    summary: 'Get paginated customer reports (Admin / Subadmin)',
    description:
      'Admin Concerns Dashboard listing reports filterable by status, targetType (ORDER or BOOKING), and search query.',
  })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  async getAllReportsAdmin(
    @Query() query: GetAdminCustomerReportQueryDto,
    @Res() res: Response,
  ) {
    return await this.customerReportService.getAllReportsAdmin({
      query,
      res,
    });
  }

  @ApiOperation({
    summary:
      'Update customer report resolution status & notify customer (Admin / Subadmin)',
    description:
      'Updates report status (VIEWED, ACCEPTED, DECLINED, RESOLVED) and triggers Firebase push notification to the customer.',
  })
  @ApiParam({ name: 'id', description: 'CustomerReport UUID' })
  @ApiBody({ type: UpdateCustomerReportStatusDto })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('admin/:id/status')
  async updateReportStatus(
    @Param('id') reportId: string,
    @Body() body: UpdateCustomerReportStatusDto,
    @Res() res: Response,
  ) {
    return await this.customerReportService.updateReportStatus({
      reportId,
      body,
      res,
    });
  }
}
