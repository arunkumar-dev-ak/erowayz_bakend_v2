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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Response } from 'express';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetCategoryQueryDto } from './dto/get-category-query.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get Popular items with filtering options' })
  @Get('popular')
  async getPopularProductBanner(
    @Res() res: Response,
    @Query() query: GetCategoryQueryDto,
  ) {
    return await this.categoryService.getAllCategory({
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
      res,
      query,
    });
  }

  @ApiOperation({ summary: 'Get categories by vendor type' })
  @ApiParam({
    name: 'vendorTypeId',
    type: String,
    description: 'Vendor Type ID',
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Pagination limit',
  })
  @Get(':vendorTypeId')
  async getCategoryByVendorType(
    @Res() res: Response,
    @Param('vendorTypeId') vendorTypeId: string,
    @Query() query: GetCategoryQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.categoryService.getCategoryByVendorId({
      res,
      query,
      vendorTypeId,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({
    description: 'Category creation payload',
    type: CreateCategoryDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('categoryImage'))
  @UsePipes(new ValidationPipe())
  @Post('/create')
  async createCategory(
    @Res() res: Response,
    @Body() body: CreateCategoryDto,
    @UploadedFile() categoryImage: Express.Multer.File,
  ) {
    if (!categoryImage) {
      throw new BadRequestException('categoryImage is required');
    }

    return await this.categoryService.createCategory({
      res,
      body,
      categoryImage,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiParam({ name: 'categoryId', type: String, description: 'Category ID' })
  @ApiBody({
    description: 'Category update payload',
    type: UpdateCategoryDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('categoryImage'))
  @Put('/update/:categoryId')
  async updateCategory(
    @Res() res: Response,
    @Body() body: UpdateCategoryDto,
    @Param('categoryId') categoryId: string,
    @UploadedFile() categoryImage?: Express.Multer.File,
  ) {
    return await this.categoryService.updateCategory({
      res,
      body,
      categoryId,
      categoryImage,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'categoryId', type: String, description: 'Category ID' })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:categoryId')
  async deleteCategory(
    @Res() res: Response,
    @Param('categoryId') categoryId: string,
  ) {
    return await this.categoryService.deletCategory({ res, categoryId });
  }
}
