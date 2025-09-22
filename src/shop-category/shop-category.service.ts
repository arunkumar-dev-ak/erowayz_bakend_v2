import { Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetShopCategoryQueryDto } from './dto/get-shop-category.dto';
import { buildShopCategoryWhereFilter } from './utils/get-shop-category.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { Response } from 'express';
import { CreateShopCategoryDto } from './dto/create-shop-category.dto';
import { CreateShopCategoryUtils } from './utils/create-shop-category.utils';
import { UpdateShopCategoryDto } from './dto/update-shop-category.dto';
import { UpdateShopCategoryUtils } from './utils/update-shop-category.utils';
import { DeleteShopCategoryUtils } from './utils/delete-shop-category.utils';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';

@Injectable()
export class ShopCategoryService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly vendorTypeService: VendorTypeService,
  ) {}

  async getShopCategory({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetShopCategoryQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildShopCategoryWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.shopCategory.count({
      where,
    });

    const shopCategorys = await this.prismaService.shopCategory.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        vendorType: true,
      },
    });

    const queries = buildQueryParams({
      name: query.name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'shopCategory',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: shopCategorys,
      meta,
      message: 'ShopCategorys retrieved successfully',
      statusCode: 200,
    });
  }

  async createShopCategory({
    body,
    res,
  }: {
    body: CreateShopCategoryDto;
    res: Response;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery } = await CreateShopCategoryUtils({
      body,
      shopCategoryService: this,
      vendorTypeService: this.vendorTypeService,
    });

    const newShopCategory = await this.prismaService.shopCategory.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newShopCategory,
      message: 'ShopCategory Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateShopCategory({
    body,
    res,
    shopCategoryId,
  }: {
    body: UpdateShopCategoryDto;
    res: Response;
    shopCategoryId: string;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { updateQuery } = await UpdateShopCategoryUtils({
      body,
      shopCategoryService: this,
      shopCategoryId,
    });

    const updatedShopCategory = await this.prismaService.shopCategory.update({
      where: {
        id: shopCategoryId,
      },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedShopCategory,
      message: 'ShopCategory Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteShopCategory({
    shopCategoryId,
    res,
  }: {
    shopCategoryId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    await DeleteShopCategoryUtils({
      shopCategoryId,
      shopCategoryService: this,
    });

    const deleteShopCategory = await this.prismaService.shopCategory.delete({
      where: {
        id: shopCategoryId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deleteShopCategory,
      message: 'ShopCategory Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getShopCategoryByName(name: string, vendorTypeId?: string) {
    return await this.prismaService.shopCategory.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        vendorTypeId,
      },
    });
  }

  async checkShopCategoryHasShop(shopCategoryId: string) {
    return await this.prismaService.shopCategory.findFirst({
      where: {
        id: shopCategoryId,
        shopInfo: { some: {} },
      },
    });
  }

  async getShopCategoryById(id: string) {
    return await this.prismaService.shopCategory.findUnique({
      where: {
        id,
      },
    });
  }

  async getShopCategoryByIdAndVendorType({
    id,
    vendorTypeId,
  }: {
    id: string;
    vendorTypeId: string;
  }) {
    return await this.prismaService.shopCategory.findUnique({
      where: {
        id,
        vendorTypeId,
      },
    });
  }
}
