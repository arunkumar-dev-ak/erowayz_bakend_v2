import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { LicenseCategoryService } from './license-category.service';
import { CreateLicenseCategoryDto } from './dto/create-license-category.dto';
import { UpdateLicenseCategoryDto } from './dto/update-license-category.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetLicenseCategoryQueryDto } from './dto/get-license-category.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('License Category')
@Controller('license-category')
export class LicenseCategoryController {
  constructor(
    private readonly licenseCategoryService: LicenseCategoryService,
  ) {}

  @ApiOperation({ summary: 'Get all License Categories (with pagination)' })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Get()
  async getLicenseCategory(
    @Res() res: Response,
    @Query() query: GetLicenseCategoryQueryDto,
  ) {
    return await this.licenseCategoryService.getLicenseCategory({
      res,
      query,
      offset: Number(query.offset ?? 0),
      limit: Number(query.limit ?? 10),
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new License Category' })
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createLicenseCategory(
    @Res() res: Response,
    @Body() body: CreateLicenseCategoryDto,
  ) {
    return await this.licenseCategoryService.createLicenseCategory({
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update License Category by ID' })
  @ApiParam({ name: 'licenseCategoryId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:licenseCategoryId')
  async updateLicenseCategory(
    @Res() res: Response,
    @Param('licenseCategoryId') licenseCategoryId: string,
    @Body() body: UpdateLicenseCategoryDto,
  ) {
    return await this.licenseCategoryService.updateLicenseCategory({
      res,
      licenseCategoryId,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete License Category by ID' })
  @ApiParam({ name: 'licenseCategoryId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:licenseCategoryId')
  async deleteLicenseCategory(
    @Res() res: Response,
    @Param('licenseCategoryId') licenseCategoryId: string,
  ) {
    return await this.licenseCategoryService.deleteLicenseCategory({
      res,
      licenseCategoryId,
    });
  }
}
