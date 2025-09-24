import { Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetLicenseCategoryQueryDto } from './dto/get-license-category.dto';
import { buildLicenseCategoryWhereFilter } from './utils/get-license-category.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { Response } from 'express';
import { CreateLicenseCategoryDto } from './dto/create-license-category.dto';
import { UpdateLicenseCategoryDto } from './dto/update-license-category.dto';
import { UpdateLicenseCategoryUtils } from './utils/update-license-category.utils';
import { CreateLicenseCategoryUtils } from './utils/create-license-category.utils';
import { DeleteLicenseCategoryUtils } from './utils/delete-license-category.utils';

@Injectable()
export class LicenseCategoryService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getLicenseCategory({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetLicenseCategoryQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildLicenseCategoryWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.licenseCategory.count({
      where,
    });

    const licenseCategorys = await this.prismaService.licenseCategory.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      name: query.name,
      status: query.status,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'licenseCategory',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: licenseCategorys,
      meta,
      message: 'LicenseCategorys retrieved successfully',
      statusCode: 200,
    });
  }

  async createLicenseCategory({
    body,
    res,
  }: {
    body: CreateLicenseCategoryDto;
    res: Response;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery } = await CreateLicenseCategoryUtils({
      body,
      licenseCategoryService: this,
    });

    const newLicenseCategory = await this.prismaService.licenseCategory.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newLicenseCategory,
      message: 'LicenseCategory Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateLicenseCategory({
    body,
    res,
    licenseCategoryId,
  }: {
    body: UpdateLicenseCategoryDto;
    res: Response;
    licenseCategoryId: string;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { updateQuery } = await UpdateLicenseCategoryUtils({
      body,
      licenseCategoryService: this,
      licenseCategoryId,
    });

    const updatedLicenseCategory =
      await this.prismaService.licenseCategory.update({
        where: {
          id: licenseCategoryId,
        },
        data: updateQuery,
      });

    return this.responseService.successResponse({
      res,
      data: updatedLicenseCategory,
      message: 'LicenseCategory Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteLicenseCategory({
    licenseCategoryId,
    res,
  }: {
    licenseCategoryId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    await DeleteLicenseCategoryUtils({
      licenseCategoryId,
      licenseCategoryService: this,
    });

    const deleteLicenseCategory =
      await this.prismaService.licenseCategory.delete({
        where: {
          id: licenseCategoryId,
        },
      });

    return this.responseService.successResponse({
      res,
      data: deleteLicenseCategory,
      message: 'LicenseCategory Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getLicenseCategoryByName(name: string) {
    return await this.prismaService.licenseCategory.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async checkLicenseCategoryHasLicense(licenseId: string) {
    return await this.prismaService.licenseCategory.findFirst({
      where: {
        id: licenseId,
        license: { some: {} },
      },
    });
  }

  async getLicenseCategoryById(id: string) {
    return await this.prismaService.licenseCategory.findUnique({
      where: {
        id,
      },
    });
  }
}
