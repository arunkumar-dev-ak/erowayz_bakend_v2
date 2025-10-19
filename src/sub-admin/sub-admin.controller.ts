import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubAdminService } from './sub-admin.service';
import { Request, Response } from 'express';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { LoginSubAdminDto } from './dto/login-sub-admin.dto';
import { LogoutSubAdminDto } from './dto/logout-sub-admin.dto';
import { Role } from '@prisma/client';
import { GetSubAdminQueryDto } from './dto/get-sub-admin.dto';

@ApiTags('SubAdmin') // Grouping APIs under 'SubAdmin' in Swagger
@Controller('sub-admin')
export class SubAdminController {
  constructor(private readonly subAdminService: SubAdminService) {}

  @Roles('ADMIN')
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all sub-admins by vendor ID',
    description: 'Retrieves all sub-admin members associated with a vendor.',
  })
  @ApiBearerAuth()
  async getAllSubAdminByVendorId(
    @Res() res: Response,
    @Query() query: GetSubAdminQueryDto,
  ) {
    return await this.subAdminService.getAllSubAdmin({
      res,
      query,
      offset: Number(query.offset ?? '0'),
      limit: Number(query.limit ?? '10'),
    });
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create sub-admin',
    description: 'Creates a new sub-admin account.',
  })
  @ApiBody({ type: CreateSubAdminDto })
  @ApiBearerAuth()
  async createSubAdmin(@Body() body: CreateSubAdminDto, @Res() res: Response) {
    return await this.subAdminService.createSubAdminAccount({
      res,
      body,
    });
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:id')
  @ApiOperation({
    summary: 'Update sub-admin',
    description: 'Updates an existing sub-admin account.',
  })
  @ApiParam({ name: 'id', type: String, description: 'SubAdmin ID' })
  @ApiBody({ type: UpdateSubAdminDto })
  @ApiBearerAuth()
  async updateSubAdmin(
    @Param('id') id: string,
    @Body() body: UpdateSubAdminDto,
    @Res() res: Response,
  ) {
    return await this.subAdminService.updateSubAdminAccount({
      id,
      body,
      res,
    });
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Delete sub-admin',
    description: 'Deletes a sub-admin account.',
  })
  @ApiParam({ name: 'id', type: String, description: 'SubAdmin ID' })
  @ApiBearerAuth()
  async deleteSubAdmin(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const vendorId = req['vendorId'] as string;
    return await this.subAdminService.deleteSubAdminAccount({
      res,
      subAdminId: id,
      vendorId,
    });
  }

  @Post('/login')
  @ApiOperation({
    summary: 'SubAdmin login',
    description: 'Authenticates a sub-admin member.',
  })
  @ApiBody({ type: LoginSubAdminDto })
  async loginSubAdmin(@Res() res: Response, @Body() body: LoginSubAdminDto) {
    return await this.subAdminService.loginSubAdminAccount({ res, body });
  }

  @Roles(Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/logout')
  @ApiOperation({
    summary: 'SubAdmin logout',
    description: 'Logs out a sub-admin member.',
  })
  @ApiBody({ type: LogoutSubAdminDto })
  @ApiBearerAuth()
  async logout(@Body() body: LogoutSubAdminDto, @Res() res: Response) {
    return await this.subAdminService.logout({ body, res });
  }

  @Roles(Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/logout-on-all-device')
  @ApiOperation({
    summary: 'Logout on all devices',
    description: 'Logs out the sub-admin account from all devices.',
  })
  @ApiBearerAuth()
  async logoutSubAdminAccountOnAllDevice(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const subAdminId = req['subAdminId'] as string; // Assuming similar extraction pattern
    return await this.subAdminService.logoutSubAdminAccountOnAllDevice({
      subAdminId,
      res,
    });
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/admin/logout-on-all-device/:id')
  @ApiOperation({
    summary: 'Admin logout sub-admin from all devices',
    description:
      'Logs out a sub-admin member from all devices via admin control.',
  })
  @ApiParam({ name: 'id', type: String, description: 'SubAdmin ID' })
  @ApiBearerAuth()
  async logoutOnAllDeviceByAdmin(
    @Res() res: Response,
    @Param('id') subAdminId: string,
  ) {
    return await this.subAdminService.logoutSubAdminAccountByVendor({
      subAdminId,
      res,
    });
  }
}
