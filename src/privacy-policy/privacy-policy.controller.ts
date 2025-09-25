// privacy-policy.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { PrivacyPolicyService } from './privacy-policy.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';
import { GetPrivacyPolicyQueryDto } from './dto/get-privacy-policy.dto';

@ApiTags('Privacy Policy')
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @ApiOperation({ summary: 'Get all Privacy Policies' })
  @ApiQuery({ name: 'userType', enum: ['CUSTOMER', 'VENDOR'], required: false })
  @ApiQuery({ name: 'vendorTypeId', type: String, required: false })
  @Get()
  async getPrivacyPolicy(
    @Res() res: Response,
    @Query() query: GetPrivacyPolicyQueryDto,
  ) {
    return await this.privacyPolicyService.getPrivacyPolicy({
      res,
      query,
      offset: parseInt(query.offset || '0'),
      limit: parseInt(query.limit || '10'),
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Privacy Policy' })
  @ApiBody({ type: CreatePrivacyPolicyDto })
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createPrivacyPolicy(
    @Res() res: Response,
    @Body() body: CreatePrivacyPolicyDto,
  ) {
    return await this.privacyPolicyService.createPrivacyPolicy({
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Privacy Policy' })
  @ApiParam({ name: 'privacyPolicyId', type: String })
  @ApiBody({ type: UpdatePrivacyPolicyDto })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:privacyPolicyId')
  async updatePrivacyPolicy(
    @Res() res: Response,
    @Param('privacyPolicyId') privacyPolicyId: string,
    @Body() body: UpdatePrivacyPolicyDto,
  ) {
    return await this.privacyPolicyService.updatePrivacyPolicy({
      res,
      body,
      privacyPolicyId,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Privacy Policy by ID' })
  @ApiParam({ name: 'privacyPolicyId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:privacyPolicyId')
  async deletePrivacyPolicy(
    @Res() res: Response,
    @Param('privacyPolicyId') privacyPolicyId: string,
  ) {
    return await this.privacyPolicyService.deletePrivacyPolicy({
      res,
      privacyPolicyId,
    });
  }
}
