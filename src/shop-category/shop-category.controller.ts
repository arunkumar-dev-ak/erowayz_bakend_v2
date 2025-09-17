import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ShopCategoryService } from './shop-category.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateShopCategoryDto } from './dto/create-shop-category.dto';
import { UpdateShopCategoryDto } from './dto/update-shop-category.dto';
import { GetShopCategoryQueryDto } from './dto/get-shop-category.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Shop Category')
@Controller('shop-category')
export class ShopCategoryController {
  constructor(private readonly shopCategoryService: ShopCategoryService) {}

  @ApiOperation({ summary: 'Get all Shop Categories with pagination & filter' })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Get()
  async getShopCategory(
    @Res() res: Response,
    @Query() query: GetShopCategoryQueryDto,
  ) {
    return await this.shopCategoryService.getShopCategory({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Shop Category' })
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createShopCategory(
    @Res() res: Response,
    @Body() body: CreateShopCategoryDto,
  ) {
    return await this.shopCategoryService.createShopCategory({ res, body });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Shop Category by ID' })
  @ApiParam({ name: 'shopCategoryId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:shopCategoryId')
  async updateShopCategory(
    @Res() res: Response,
    @Param('shopCategoryId') shopCategoryId: string,
    @Body() body: UpdateShopCategoryDto,
  ) {
    return await this.shopCategoryService.updateShopCategory({
      res,
      body,
      shopCategoryId,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Shop Category by ID' })
  @ApiParam({ name: 'shopCategoryId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:shopCategoryId')
  async deleteShopCategory(
    @Res() res: Response,
    @Param('shopCategoryId') shopCategoryId: string,
  ) {
    return await this.shopCategoryService.deleteShopCategory({
      res,
      shopCategoryId,
    });
  }
}
