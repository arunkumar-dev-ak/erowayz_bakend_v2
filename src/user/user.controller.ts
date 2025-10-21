import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { Request, Response } from 'express';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditUserDto } from './dto/edit-user.dto';
import { RoleGuard } from 'src/common/guards/role.guard';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { UserStatusChangeDto } from './dto/user-status-change.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getAll')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUB_ADMIN, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  async getAllUser(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetUserQueryDto,
  ) {
    const offsetNum = Number(query.offset);
    const limitNum = Number(query.limit);

    await this.userService.getUsers({
      query,
      res,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Get('getUserById')
  async getUserById(@Req() req: Request, @Res() res: Response) {
    const userId = extractUserIdFromRequest(req);
    await this.userService.getUserById({ res, userId });
  }

  @Get('getUserByMobile/:mobile')
  @ApiParam({
    name: 'mobile',
    type: String,
    description: 'The mobileno of the User',
  })
  async getUserByMobile(@Res() res: Response, @Param('mobile') mobile: string) {
    await this.userService.getUserByMobile({
      res,
      mobile,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update')
  @ApiOperation({ summary: 'Update User Details' })
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  async updateUserDetails(
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
    @Body() body: EditUserDto,
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const userId = currentUser.id;
    const existingRelativePath = currentUser.relativeUrl;

    return await this.userService.updateCustomer({
      userId,
      body,
      res,
      image,
      existingRelativeUrl: existingRelativePath ?? undefined,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('update/status')
  @ApiOperation({ summary: 'Update User status' })
  @ApiBearerAuth()
  async updateUserStatus(
    @Body() body: UserStatusChangeDto,
    @Res() res: Response,
  ) {
    return await this.userService.changeUserStatus({
      body,
      res,
    });
  }
}
