import { Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetCityQueryDto } from './dto/get-city.dto';
import { buildCityWhereFilter } from './utils/get-city.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { Response } from 'express';
import { CreateCityDto } from './dto/create-city-category.dto';
import { CreateCityUtils } from './utils/create-city.utils';
import { UpdateCityDto } from './dto/update-city.dto';
import { UpdateCityUtils } from './utils/update-city.utils';
import { DeleteCityUtils } from './utils/delete-city.utils';

@Injectable()
export class CityService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getCity({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetCityQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildCityWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.shopCity.count({
      where,
    });

    const citys = await this.prismaService.shopCity.findMany({
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
      path: 'city',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: citys,
      meta,
      message: 'Citys retrieved successfully',
      statusCode: 200,
    });
  }

  async createCity({ body, res }: { body: CreateCityDto; res: Response }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery } = await CreateCityUtils({
      body,
      cityService: this,
    });

    const newCity = await this.prismaService.shopCity.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newCity,
      message: 'City Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateCity({
    body,
    res,
    cityId,
  }: {
    body: UpdateCityDto;
    res: Response;
    cityId: string;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { updateQuery } = await UpdateCityUtils({
      body,
      cityService: this,
      cityId,
    });

    const updatedCity = await this.prismaService.shopCity.update({
      where: {
        id: cityId,
      },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedCity,
      message: 'City Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteCity({ cityId, res }: { cityId: string; res: Response }) {
    const initialDate = new Date();

    await DeleteCityUtils({
      cityId,
      cityService: this,
    });

    const deleteCity = await this.prismaService.shopCity.delete({
      where: {
        id: cityId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deleteCity,
      message: 'City Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getCityByName(name: string) {
    return await this.prismaService.shopCity.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async checkCityHasShop(cityId: string) {
    return await this.prismaService.shopCity.findFirst({
      where: {
        id: cityId,
        shopInfo: { some: {} },
      },
    });
  }

  async getCityById(id: string) {
    return await this.prismaService.shopCity.findUnique({
      where: {
        id,
      },
    });
  }
}
