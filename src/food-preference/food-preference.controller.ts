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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request, Response } from 'express';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { CreateFoodPreferenceDto } from './dto/create-food-preference.dto';
import { GetAdminFoodPreferenceQueryDto } from './dto/get-admin-food-preference-query.dto';
import { GetCustomerFoodPreferenceQueryDto } from './dto/get-customer-food-preference-query.dto';
import { UpdateFoodPreferenceDto } from './dto/update-food-preference.dto';
import { FoodPreferenceService } from './food-preference.service';

@ApiTags('food-preference')
@Controller('food-preference')
export class FoodPreferenceController {
  constructor(private readonly foodPreferenceService: FoodPreferenceService) {}

  @ApiOperation({
    summary:
      'Get paginated food preferences for authenticated customer based on cart subcategories',
    description:
      'Validates cart ownership, extracts unique SubCategory IDs across cart items, and returns maxSelectionLimit (from env MAX_FOOD_PREFERENCES_PER_ORDER) along with active bilingual preferences.',
  })
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('customer')
  async getCustomerFoodPreferences(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetCustomerFoodPreferenceQueryDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    return await this.foodPreferenceService.getCustomerFoodPreferences({
      userId,
      query,
      res,
    });
  }

  @ApiOperation({
    summary: 'Get all food preferences (Admin / Subadmin)',
    description:
      'Returns paginated list of bilingual food preferences filterable by subCategoryId, isActive, and search text.',
  })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  async getAllAdmin(
    @Query() query: GetAdminFoodPreferenceQueryDto,
    @Res() res: Response,
  ) {
    return await this.foodPreferenceService.getAllAdmin({ query, res });
  }

  @ApiOperation({
    summary:
      'Create a food preference mapped to a SubCategory (Admin / Subadmin)',
  })
  @ApiBody({ type: CreateFoodPreferenceDto })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Post('admin')
  async create(@Body() body: CreateFoodPreferenceDto, @Res() res: Response) {
    return await this.foodPreferenceService.create({ body, res });
  }

  @ApiOperation({
    summary: 'Update a food preference (Admin / Subadmin)',
  })
  @ApiParam({ name: 'id', description: 'FoodPreference UUID' })
  @ApiBody({ type: UpdateFoodPreferenceDto })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Put('admin/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateFoodPreferenceDto,
    @Res() res: Response,
  ) {
    return await this.foodPreferenceService.update({ id, body, res });
  }

  @ApiOperation({
    summary:
      'Delete a food preference (Admin / Subadmin) — cascades & unlinks from orders',
  })
  @ApiParam({ name: 'id', description: 'FoodPreference UUID' })
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('admin/:id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    return await this.foodPreferenceService.delete({ id, res });
  }
}
