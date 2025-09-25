// terms-and-condition.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { TermsAndConditionService } from './terms-and-condition.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { GetTermsAndConditionQueryDto } from './dto/get-terms-query.dto';
import { CreateTermsAndConditionDto } from './dto/create-terms-and-condition-policy.dto';
import { UpdateTermsAndConditionDto } from './dto/update-terms-and-condition.dto';

@ApiTags('Terms And Condition')
@Controller('terms-and-condition')
export class TermsAndConditionController {
  constructor(
    private readonly termsAndConditionService: TermsAndConditionService,
  ) {}

  @ApiOperation({ summary: 'Get all Terms and Conditions' })
  @ApiQuery({ name: 'userType', enum: ['CUSTOMER', 'VENDOR'], required: false })
  @ApiQuery({ name: 'vendorTypeId', type: String, required: false })
  @Get()
  async getTermsAndCondition(
    @Res() res: Response,
    @Query() query: GetTermsAndConditionQueryDto,
  ) {
    return await this.termsAndConditionService.getTermsAndCondition({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Terms and Condition' })
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createTermsAndCondition(
    @Res() res: Response,
    @Body() body: CreateTermsAndConditionDto,
  ) {
    return await this.termsAndConditionService.createTermsAndCondition({
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Terms and Condition' })
  @ApiParam({ name: 'termsId', type: String, description: 'Terms ID' })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:termsId')
  async updateTermsAndCondition(
    @Res() res: Response,
    @Param('termsId') termsId: string,
    @Body() body: UpdateTermsAndConditionDto,
  ) {
    return await this.termsAndConditionService.updateTermsAndCondition({
      res,
      body,
      termsId,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Terms and Condition by ID' })
  @ApiParam({ name: 'termsAndConditionId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:termsAndConditionId')
  async deleteTermsAndCondition(
    @Param('termsAndConditionId') termsAndConditionId: string,
    @Res() res: Response,
  ) {
    return await this.termsAndConditionService.deleteTermsAndCondition({
      termsAndConditionId,
      res,
    });
  }
}
