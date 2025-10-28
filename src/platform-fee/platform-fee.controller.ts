import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PlatformFeeService } from './platform-fee.service';
import { GetPlatformFeeQueryDto } from './dto/get-platform-fee.dto';
import { CreatePlatformFeeDto } from './dto/create-platform-fee.dto';
import { UpdatePlatformFeeDto } from './dto/update-platform-fee.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('platform-fee')
export class PlatformFeeController {
  constructor(private readonly platformFeeService: PlatformFeeService) {}

  // 🔹 GET: Fetch Platform Fees
  @ApiOperation({ summary: 'Get Platform Fees with filtering & pagination' })
  @Get()
  async getPlatformFees(
    @Res() res: Response,
    @Query() query: GetPlatformFeeQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.platformFeeService.getPlatformFee({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  // 🔹 POST: Create Platform Fee
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Platform Fee' })
  @ApiBody({
    description: 'Platform Fee creation payload',
    type: CreatePlatformFeeDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @Post('/create')
  async createPlatformFee(
    @Res() res: Response,
    @Body() body: CreatePlatformFeeDto,
  ) {
    return await this.platformFeeService.createPlatformFees({
      res,
      body,
    });
  }

  // 🔹 PUT: Update Platform Fee
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing Platform Fee' })
  @ApiParam({
    name: 'platformFeeId',
    type: String,
    description: 'Platform Fee ID',
  })
  @ApiBody({
    description: 'Platform Fee update payload',
    type: UpdatePlatformFeeDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:platformFeeId')
  async updatePlatformFee(
    @Res() res: Response,
    @Body() body: UpdatePlatformFeeDto,
    @Param('platformFeeId') platformFeeId: string,
  ) {
    return await this.platformFeeService.updatePlatformFee({
      res,
      body,
      platformFeeId,
    });
  }

  // 🔹 DELETE: Delete Platform Fee
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Platform Fee' })
  @ApiParam({
    name: 'platformFeeId',
    type: String,
    description: 'Platform Fee ID',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:platformFeeId')
  async deletePlatformFee(
    @Res() res: Response,
    @Param('platformFeeId') platformFeeId: string,
  ) {
    return await this.platformFeeService.deletePlatformFee({
      res,
      platformFeeId,
    });
  }
}
