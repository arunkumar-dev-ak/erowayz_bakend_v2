import {
  Body,
  Controller,
  Get,
  Param,
  Put,
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
import { Response } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/roles/roles.docorator';
import { ResponseService } from '../response/response.service';
import { UpdateTrustSettingDto } from './dto/update-trust-setting.dto';
import { TrustBadgeService } from './trust-badge.service';

@ApiTags('trust-badge')
@Controller('trust-badge')
export class TrustBadgeController {
  constructor(
    private readonly trustBadgeService: TrustBadgeService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({
    summary: 'Get customer trust badge stats and breakdown',
    description:
      'Returns whether customer is trusted, total cumulative completed orders across all 3 verticals, and threshold.',
  })
  @ApiParam({ name: 'userId', description: 'User ID of the customer' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('customer/:userId')
  async getCustomerTrustStats(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const initialDate = new Date();
    const data = await this.trustBadgeService.getCustomerTrustStats(userId);
    return this.responseService.successResponse({
      res,
      data,
      message: 'Customer trust stats retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  @ApiOperation({
    summary: 'Get current Trust Badge settings (Admin only)',
    description:
      'Fetches the active order threshold required for customer trust badge.',
  })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('settings')
  async getSettings(@Res() res: Response) {
    const initialDate = new Date();
    const data = await this.trustBadgeService.getTrustSettings();
    return this.responseService.successResponse({
      res,
      data,
      message: 'Trust settings retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  @ApiOperation({
    summary: 'Update Trust Badge threshold settings (Admin only)',
    description:
      'Allows admin to configure required order threshold (e.g. 15 completed orders) and toggle active status.',
  })
  @ApiBody({ type: UpdateTrustSettingDto })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Put('settings')
  async updateSettings(
    @Body() body: UpdateTrustSettingDto,
    @Res() res: Response,
  ) {
    return await this.trustBadgeService.updateTrustSettings({ body, res });
  }
}
