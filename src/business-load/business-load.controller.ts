import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { BusinessLoadService } from './business-load.service';
import { CreateBusinessLoadTierDto } from './dto/create-business-load-tier.dto';
import { UpdateBusinessLoadTierDto } from './dto/update-business-load-tier.dto';

@ApiTags('business-load')
@Controller('business-load')
export class BusinessLoadController {
  constructor(
    private readonly businessLoadService: BusinessLoadService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({
    summary: 'Get dynamic busy status & estimated wait-time for a specific vendor',
    description:
      'Evaluates active in-progress cooking orders for the vendor and matches against active load tiers with 1-day Redis caching.',
  })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @Get('vendor/:vendorId')
  async getVendorBusinessLoad(
    @Param('vendorId') vendorId: string,
    @Res() res: Response,
  ) {
    const initialDate = new Date();
    const data =
      await this.businessLoadService.getVendorBusinessLoad(vendorId);

    return this.responseService.successResponse({
      res,
      data,
      message: 'Vendor business load retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  @ApiOperation({
    summary: 'Get all business load tiers (Admin / Subadmin)',
    description:
      'Lists all configured business load tiers (active & inactive) sorted by orderIndex.',
  })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin/tiers')
  async getAllTiersAdmin(@Res() res: Response) {
    const initialDate = new Date();
    const data = await this.businessLoadService.getAllTiersAdmin();

    return this.responseService.successResponse({
      res,
      data,
      message: 'Business load tiers retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  @ApiOperation({
    summary: 'Create a new business load tier (Admin / Subadmin)',
    description:
      'Creates a new customizable tier (editable name, thresholds, color, wait time) and invalidates Redis cache.',
  })
  @ApiBody({ type: CreateBusinessLoadTierDto })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Post('admin/tiers')
  async createTier(
    @Body() body: CreateBusinessLoadTierDto,
    @Res() res: Response,
  ) {
    const initialDate = new Date();
    const data = await this.businessLoadService.createTier(body);

    return this.responseService.successResponse({
      res,
      data,
      message: 'Business load tier created successfully',
      statusCode: 201,
      initialDate,
    });
  }

  @ApiOperation({
    summary: 'Update a business load tier (Admin / Subadmin)',
    description:
      'Updates an existing tier (name, order count thresholds, color, wait-time text, active status) and invalidates Redis cache.',
  })
  @ApiParam({ name: 'id', description: 'Tier UUID' })
  @ApiBody({ type: UpdateBusinessLoadTierDto })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Put('admin/tiers/:id')
  async updateTier(
    @Param('id') id: string,
    @Body() body: UpdateBusinessLoadTierDto,
    @Res() res: Response,
  ) {
    const initialDate = new Date();
    const data = await this.businessLoadService.updateTier(id, body);

    return this.responseService.successResponse({
      res,
      data,
      message: 'Business load tier updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  @ApiOperation({
    summary: 'Delete a business load tier (Admin / Subadmin)',
    description: 'Permanently deletes a tier and invalidates Redis cache.',
  })
  @ApiParam({ name: 'id', description: 'Tier UUID' })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('admin/tiers/:id')
  async deleteTier(@Param('id') id: string, @Res() res: Response) {
    const initialDate = new Date();
    const data = await this.businessLoadService.deleteTier(id);

    return this.responseService.successResponse({
      res,
      data,
      message: 'Business load tier deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
