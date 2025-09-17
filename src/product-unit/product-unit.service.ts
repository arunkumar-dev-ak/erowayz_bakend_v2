import { Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { Response } from 'express';
import { GetProductUnitQueryDto } from './dto/get-product-unit.dto';
import { buildProductUnitWhereFilter } from './utils/get-product-unit.utils';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { CreateProductUnitUtils } from './utils/create-product-unit.utils';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { UpdateProductUnitUtils } from './utils/update-product-unit.utils';
import { DeleteProductUnitUtils } from './utils/delete-product-unit.utils';

@Injectable()
export class ProductUnitService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getProductUnit({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetProductUnitQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildProductUnitWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.productUnit.count({
      where,
    });

    const productUnits = await this.prismaService.productUnit.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      name: query.name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'productUnit',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: productUnits,
      meta,
      message: 'ProductUnits retrieved successfully',
      statusCode: 200,
    });
  }

  async createProductUnit({
    body,
    res,
  }: {
    body: CreateProductUnitDto;
    res: Response;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery } = await CreateProductUnitUtils({
      body,
      productUnitService: this,
    });

    const newProductUnit = await this.prismaService.productUnit.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newProductUnit,
      message: 'ProductUnit Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateProductUnit({
    body,
    res,
    productUnitId,
  }: {
    body: UpdateProductUnitDto;
    res: Response;
    productUnitId: string;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { updateQuery } = await UpdateProductUnitUtils({
      body,
      productUnitService: this,
      productUnitId,
    });

    const updatedProductUnit = await this.prismaService.productUnit.update({
      where: {
        id: productUnitId,
      },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedProductUnit,
      message: 'ProductUnit Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteProductUnit({
    productUnitId,
    res,
  }: {
    productUnitId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    await DeleteProductUnitUtils({
      productUnitId,
      productUnitService: this,
    });

    const deleteProductUnit = await this.prismaService.productUnit.delete({
      where: {
        id: productUnitId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deleteProductUnit,
      message: 'ProductUnit Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getProductUnitByName(name: string) {
    return await this.prismaService.productUnit.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async checkProductUnitHasItem(itemId: string) {
    return await this.prismaService.productUnit.findFirst({
      where: {
        id: itemId,
        item: { some: {} },
      },
    });
  }

  async getProductUnitById(id: string) {
    return await this.prismaService.productUnit.findUnique({
      where: {
        id,
      },
    });
  }
}
