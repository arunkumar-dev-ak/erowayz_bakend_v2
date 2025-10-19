import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { GetSubCategoryQueryDto } from './dto/get-sub-category-query.dto';

@ApiTags('SubCategory')
@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Get(':categoryId')
  @ApiOperation({ summary: 'Get subcategories by category ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiQuery({ name: 'offset', required: false, example: '0' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  getSubCategoryByCategory(
    @Param('categoryId') categoryId: string,
    @Query('offset') offset = '0',
    @Query('limit') limit = '10',
    @Res() res: Response,
  ) {
    const offsetNum = Number(offset) || 0;
    const limitNum = Number(limit) || 10;
    return this.subCategoryService.getSubCategoryByCategory({
      res,
      categoryId,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @ApiOperation({ summary: 'Get Sub Category with filtering options' })
  @Get('getAll/admin')
  async getPopularProductBanner(
    @Res() res: Response,
    @Query() query: GetSubCategoryQueryDto,
  ) {
    return await this.subCategoryService.getAllSubCategory({
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
      res,
      query,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subcategory' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('subCategoryImage'))
  async createSubCategory(
    @Body() body: CreateSubCategoryDto,
    @Res() res: Response,
    @UploadedFile() subCategoryImage: Express.Multer.File,
  ) {
    if (!subCategoryImage) {
      throw new BadRequestException('subCategoryImage is required');
    }

    return await this.subCategoryService.createSubCategory({
      res,
      body,
      subCategoryImage,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:subCategoryId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing subcategory' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'subCategoryId', description: 'SubCategory ID' })
  @UseInterceptors(FileInterceptor('subCategoryImage'))
  async updateSubCategory(
    @Param('subCategoryId') subCategoryId: string,
    @Body() body: UpdateSubCategoryDto,
    @Res() res: Response,
    @UploadedFile() subCategoryImage: Express.Multer.File,
  ) {
    return await this.subCategoryService.updateSubCategory({
      subCategoryId,
      res,
      body,
      subCategoryImage,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:subCategoryId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subcategory' })
  @ApiParam({ name: 'subCategoryId', description: 'SubCategory ID' })
  async deleteSubCategory(
    @Res() res: Response,
    @Param('subCategoryId') subCategoryId: string,
  ) {
    return await this.subCategoryService.deleteSubCategory({
      res,
      subCategoryId,
    });
  }
}
