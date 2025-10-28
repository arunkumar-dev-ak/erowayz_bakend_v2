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
import { ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserReportService } from './user-report.service';
import { GetUserReportQueryDto } from './dto/get-user-report.dto';
import { CreateUserReportDto } from './dto/create-user-report.dto';
import { UpdateUserReportDto } from './dto/update-user-report.dto';
import { UpdateUserReportStatusDto } from './dto/update-user-report-status.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';

@Controller('user-report')
export class UserReportController {
  constructor(private readonly userReportService: UserReportService) {}

  @ApiOperation({ summary: 'Get User Reports with filtering & pagination' })
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  async getUserReports(
    @Res() res: Response,
    @Query() query: GetUserReportQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.userReportService.getUserReport({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @ApiOperation({ summary: 'Get User Reports with filtering & pagination' })
  @Roles(Role.VENDOR, Role.STAFF, Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Get('user')
  async getUserReportsForUser(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetUserReportQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    const userId = extractUserIdFromRequest(req);

    return await this.userReportService.getUserReport({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
      userId,
    });
  }

  // 🔹 POST: Create a new User Report (Vendor or Customer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new User Report' })
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
    const userId = extractUserIdFromRequest(req);

    const isVendor =
      currentUser.vendor || (currentUser.staff && currentUser.staff.length > 0);

    return await this.userReportService.createUserReport({
      res,
      body,
      userId,
      isVendor: isVendor ? true : false,
    });
  }

  // 🔹 PUT: Update an existing User Report (allowed only if Pending & same user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing User Report' })
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:userReportId')
  async updateUserReport(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateUserReportDto,
    @Param('userReportId') userReportId: string,
  ) {
    const userId = extractUserIdFromRequest(req);

    return await this.userReportService.updateUserReport({
      res,
      body,
      userId,
      userReportId,
    });
  }

  // 🔹 PUT: Update User Report Status (Admin/SubAdmin only)
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update User Report Status (Admin Only)' })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update-status/:userReportId')
  async updateUserReportStatus(
    @Res() res: Response,
    @Body() body: UpdateUserReportStatusDto,
    @Param('userReportId') userReportId: string,
  ) {
    return await this.userReportService.updateUserReportStatus({
      res,
      body,
      userReportId,
    });
  }
}
