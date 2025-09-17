import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { StaffService } from './staff.service';
import { Request, Response } from 'express';
import { CreateStaffDto } from './dto/createstaff.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UpdateStaffDto } from './dto/updatestaff.dto';
import { LoginStaffDto } from './dto/loginstaff.dto';
import { LogoutStaffDto } from './dto/logoutstaff.dto';
import { extractStaffIdFromRequest } from 'src/common/functions/extractStaffId';
import { Role } from '@prisma/client';

@ApiTags('Staff') // Grouping APIs under 'Staff' in Swagger
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Roles('VENDOR')
  @UseGuards(AuthGuard, RoleGuard)
  @Get('getAllStaffByVendorId')
  @ApiOperation({
    summary: 'Get all staff by vendor ID',
    description: 'Retrieves all staff members associated with a vendor.',
  })
  @ApiBearerAuth()
  async getAllStaffsByVendorId(@Req() req: Request, @Res() res: Response) {
    const vendorId = req['vendorId'] as string;
    return await this.staffService.getAllStaffByVendorId({ res, vendorId });
  }

  @Roles('VENDOR')
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create staff',
    description: 'Creates a new staff account.',
  })
  @ApiBody({ type: CreateStaffDto })
  @ApiBearerAuth()
  async createStaff(
    @Req() req: Request,
    @Body() body: CreateStaffDto,
    @Res() res: Response,
  ) {
    const vendorId = req['vendorId'] as string;
    return await this.staffService.createStaffAccount({ vendorId, res, body });
  }

  @Roles('VENDOR')
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:id')
  @ApiOperation({
    summary: 'Update staff',
    description: 'Updates an existing staff account.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Staff ID' })
  @ApiBody({ type: UpdateStaffDto })
  @ApiBearerAuth()
  async updateStaff(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateStaffDto,
    @Res() res: Response,
  ) {
    const vendorId = req['vendorId'] as string;
    return await this.staffService.updateStaffAccount({
      vendorId,
      id,
      body,
      res,
    });
  }

  @Roles('VENDOR')
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Delete staff',
    description: 'Deletes a staff account.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Staff ID' })
  @ApiBearerAuth()
  async deleteStaff(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const vendorId = req['vendorId'] as string;
    return await this.staffService.deleteStaffAccount({
      res,
      staffId: id,
      vendorId,
    });
  }

  @Post('/login')
  @ApiOperation({
    summary: 'Staff login',
    description: 'Authenticates a staff member.',
  })
  @ApiBody({ type: LoginStaffDto })
  async loginStaff(@Res() res: Response, @Body() body: LoginStaffDto) {
    return await this.staffService.loginStaffAccount({ res, body });
  }

  @Roles(Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/logout')
  @ApiOperation({
    summary: 'Staff logout',
    description: 'Logs out a staff member.',
  })
  @ApiBody({ type: LogoutStaffDto })
  @ApiBearerAuth()
  async logout(@Body() body: LogoutStaffDto, @Res() res: Response) {
    return await this.staffService.logout({ body, res });
  }

  @Roles(Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/logout-on-all-device')
  @ApiOperation({
    summary: 'Logout on all devices',
    description: 'Logs out the staff account from all devices.',
  })
  @ApiBearerAuth()
  async logoutStaffAccountOnAllDevice(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const staffId = extractStaffIdFromRequest(req);
    return await this.staffService.logoutStaffAccountOnAllDevice({
      staffId,
      res,
    });
  }

  @Roles('VENDOR')
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/vendor/logout-on-all-device/:id')
  @ApiOperation({
    summary: 'Vendor logout staff from all devices',
    description: 'Logs out a staff member from all devices via vendor control.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Staff ID' })
  @ApiBearerAuth()
  async logoutOnAllDeviceByVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') staffId: string,
  ) {
    const vendorId = req['vendorId'] as string;
    return await this.staffService.logoutStaffAccountByVendor({
      vendorId,
      staffId,
      res,
    });
  }
}
