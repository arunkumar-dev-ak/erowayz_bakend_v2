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
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

import { SubscriptionService } from './subscription.service';
import { GetSubscriptionPlanQueryDto } from './dto/get-subscription-query.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ChangeSubScriptionStatus } from './dto/change-subscription-status.dto';
import { GetSubTransactionQueryForAdminDto } from './dto/get-sub-transaction-query.dto';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation({
    summary: 'Get All Subscription Plans',
  })
  @Get()
  async getSubscription(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetSubscriptionPlanQueryDto,
  ) {
    await this.subscriptionService.getSubscription({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('transaction')
  async getTransaction(
    @Res() res: Response,
    @Query() query: GetSubTransactionQueryForAdminDto,
  ) {
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');
    await this.subscriptionService.getSubTransaction({
      query,
      res,
      offset,
      limit,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Subscription Plan',
  })
  @Post('create')
  async createSubscription(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateSubscriptionDto,
  ) {
    await this.subscriptionService.createSubscription({
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Subscription Plan',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the subscription plan',
  })
  @Put('update/:id')
  async updateSubscription(
    @Res() res: Response,
    @Body() body: UpdateSubscriptionDto,
    @Param('id') subPlanId: string,
  ) {
    await this.subscriptionService.updateSubscription({
      res,
      body,
      subPlanId,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change Subscription Plan Status',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the subscription plan',
  })
  @Put('change-status/:id')
  async changeSubScriptionStatus(
    @Res() res: Response,
    @Body() body: ChangeSubScriptionStatus,
    @Param('id') subPlanId: string,
  ) {
    await this.subscriptionService.changeSubScriptionStatus({
      res,
      body,
      subPlanId,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Subscription Plan',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the subscription plan',
  })
  @Delete('remove/:id')
  async deleteSubScriptionPlan(
    @Res() res: Response,
    @Param('id') subPlanId: string,
  ) {
    await this.subscriptionService.deleteSubScriptionPlan({
      res,
      subPlanId,
    });
  }
}
