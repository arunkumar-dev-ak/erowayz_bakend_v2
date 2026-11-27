import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UserReportService } from './user-report.service';
import { GetUserReportQueryDto } from './dto/get-user-report.dto';
import { CreateUserReportDto } from './dto/create-user-report.dto';
import { UpdateUserReportDto } from './dto/update-user-report.dto';
import { UpdateUserReportStatusDto } from './dto/update-user-report-status.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { throwAppUpdateRequired } from 'src/common/functions/app-version.utils';

@ApiTags('user-report (Deprecated)')
@Controller('user-report')
export class UserReportController {
  constructor(private readonly userReportService: UserReportService) {}

  @ApiOperation({ summary: 'Get User Reports with filtering & pagination (Deprecated)' })
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  async getUserReports(
    @Res() res: Response,
    @Query() query: GetUserReportQueryDto,
  ) {
    throwAppUpdateRequired({ featureName: 'Customer Concerns & Support' });
  }

  @ApiOperation({ summary: 'Get User Reports with filtering & pagination (Deprecated)' })
  @Roles(Role.VENDOR, Role.STAFF, Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Get('user')
  async getUserReportsForUser(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetUserReportQueryDto,
  ) {
    throwAppUpdateRequired({ featureName: 'Customer Concerns & Support' });
  }

  // 🔹 POST: Create a new User Report (Deprecated)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new User Report (Deprecated)' })
  @ApiBody({
    description: 'User Report creation payload',
    type: CreateUserReportDto,
  })
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @Post('/create')
  async createUserReport(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: CreateUserReportDto,
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff[] },
  ) {
    throwAppUpdateRequired({ featureName: 'Customer Concerns & Support' });
  }

  // 🔹 PUT: Update an existing User Report (Deprecated)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing User Report (Deprecated)' })
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:userReportId')
  async updateUserReport(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateUserReportDto,
    @Param('userReportId') userReportId: string,
  ) {
    throwAppUpdateRequired({ featureName: 'Customer Concerns & Support' });
  }

  // 🔹 PUT: Update User Report Status (Deprecated)
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update User Report Status (Deprecated)' })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update-status/:userReportId')
  async updateUserReportStatus(
    @Res() res: Response,
    @Body() body: UpdateUserReportStatusDto,
    @Param('userReportId') userReportId: string,
  ) {
    throwAppUpdateRequired({ featureName: 'Customer Concerns & Support' });
  }
}
