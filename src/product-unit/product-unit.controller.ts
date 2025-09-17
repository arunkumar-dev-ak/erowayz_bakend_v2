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
import { ProductUnitService } from './product-unit.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { GetProductUnitQueryDto } from './dto/get-product-unit.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Product Unit')
@Controller('product-unit')
export class ProductUnitController {
  constructor(private readonly productUnitService: ProductUnitService) {}

  @ApiOperation({ summary: 'Get all Product Units with pagination & filter' })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Get()
  async getProductUnit(
    @Res() res: Response,
    @Query() query: GetProductUnitQueryDto,
  ) {
    return await this.productUnitService.getProductUnit({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Product Unit' })
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createProductUnit(
    @Res() res: Response,
    @Body() body: CreateProductUnitDto,
  ) {
    return await this.productUnitService.createProductUnit({ res, body });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Product Unit by ID' })
  @ApiParam({ name: 'productUnitId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:productUnitId')
  async updateProductUnit(
    @Res() res: Response,
    @Param('productUnitId') productUnitId: string,
    @Body() body: UpdateProductUnitDto,
  ) {
    return await this.productUnitService.updateProductUnit({
      res,
      body,
      productUnitId,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Product Unit by ID' })
  @ApiParam({ name: 'productUnitId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:productUnitId')
  async deleteProductUnit(
    @Res() res: Response,
    @Param('productUnitId') productUnitId: string,
  ) {
    return await this.productUnitService.deleteProductUnit({
      res,
      productUnitId,
    });
  }
}
