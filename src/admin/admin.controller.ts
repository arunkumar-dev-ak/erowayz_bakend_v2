import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Request, Response } from 'express';
import { AdminLogoutDto } from './dto/adminlogout.dto';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { extractAdminIdFromRequest } from 'src/common/functions/extractAdminId';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Admin Login',
    description: 'Logs in an admin user',
  })
  @ApiBody({ type: AdminLoginDto })
  loginAdmin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AdminLoginDto,
  ) {
    return this.adminService.loginAdmin({ res, body });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'Admin Logout',
    description: 'Logs out an admin user',
  })
  @ApiBody({ type: AdminLogoutDto })
  logoutAdmin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AdminLogoutDto,
  ) {
    return this.adminService.logout({ res, body });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('logout-on-all-devices')
  @ApiOperation({
    summary: 'Logout on all devices',
    description: 'Logs out the admin from all devices',
  })
  logoutOnAllDevices(@Req() req: Request, @Res() res: Response) {
    const adminId = extractAdminIdFromRequest(req);
    return this.adminService.logoutOnAllDevive({ adminId, res });
  }
}
