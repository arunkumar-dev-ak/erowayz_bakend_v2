import { BadRequestException, Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { createKeyWordDto } from './dto/create-keyword.dto';
import { Response } from 'express';
import { KeyWordType, Prisma } from '@prisma/client';
import { updateKeyWordDto } from './dto/update-keyword.dto';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { KeyWordUpdateUtils } from './utils/keyword-update.utils';
import { GetKeyWordQueryDto } from './dto/get-keyword-query.dto';
import { buildKeywordWhereFilter } from './utils/get-keyword.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class KeywordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly vendorTypeService: VendorTypeService,
  ) {}

  async getKeyword({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetKeyWordQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildKeywordWhereFilter({
      query,
    });

    const totalCount = await this.prisma.keyWord.count({ where });

    const keyWords = await this.prisma.keyWord.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendorType: true,
      },
      orderBy: {
        vendorType: {
          name: 'asc',
        },
      },
    });

    const queries = buildQueryParams({
      vendorTypeId: query.vendorTypeId,
      KeyWordType: query.keyWordType,
      keyWordName: query.keywordName,
      status: query.status,
      keyWordid: query.keywordId,
      vendorCategoryType: query.vendorCategoryType,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'keyword',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: keyWords,
      meta,
      message: 'keyWords retrieved successfully',
      statusCode: 200,
    });
  }

  async createKeyWord({
    body,
    res,
  }: {
    body: createKeyWordDto;
    res: Response;
  }) {
    const initialDate = new Date();

    const { name, vendorTypeId, keyWordType, status } = body;

    const [existingKeyword, VendorType] = await Promise.all([
      await this.checkKeyWordByName({ vendorTypeId, name, keyWordType }),
      await this.vendorTypeService.findVendorTypeById(vendorTypeId),
    ]);

    //check for unique name
    if (existingKeyword) {
      throw new BadRequestException(
        `${name} already exists for this vendorType`,
      );
    } else if (!VendorType) {
      throw new BadRequestException(`VendorType not exists`);
    }

    const keyword = await this.prisma.keyWord.create({
      data: {
        name,
        vendorTypeId,
        keyWordType,
        status,
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: keyword,
      message: 'Keyword created successfully',
      statusCode: 200,
    });
  }

  async updateKeyWord({
    body,
    res,
    keyWordId,
  }: {
    body: updateKeyWordDto;
    res: Response;
    keyWordId: string;
  }) {
    const initialDate = new Date();
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No valid fields provided to update');
    }
    //need to check that body
    const { name, vendorTypeId, keyWordType, status } = body;

    const existingKeyWord = await this.findKeyWordById(keyWordId);
    if (!existingKeyWord) {
      throw new BadRequestException('Keyword not found');
    }

    await KeyWordUpdateUtils({
      body,
      vendorTypeService: this.vendorTypeService,
      existingKeyWord,
      keyWordId,
      prisma: this.prisma,
    });

    const updatePayload: Prisma.keyWordUpdateInput = {};
    if (name !== undefined) updatePayload.name = name;
    if (vendorTypeId !== undefined)
      updatePayload.vendorType = {
        connect: { id: vendorTypeId },
      };
    if (keyWordType !== undefined) updatePayload.keyWordType = keyWordType;
    if (status !== undefined) updatePayload.status = status;

    const updatedKeyword = await this.prisma.keyWord.update({
      where: { id: keyWordId },
      data: updatePayload,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: updatedKeyword,
      message: 'Keyword updated successfully',
      statusCode: 200,
    });
  }

  async deleteKeyWord({
    res,
    keyWordId,
  }: {
    res: Response;
    keyWordId: string;
  }) {
    const initialDate = new Date();
    const existingKeyword = await this.findKeyWordById(keyWordId);

    if (!existingKeyword) {
      throw new BadRequestException('Keyword not exists');
    }

    const deletedKeyWord = await this.prisma.keyWord.delete({
      where: {
        id: keyWordId,
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: deletedKeyWord,
      message: 'Keyword deleted successfully',
      statusCode: 200,
    });
  }

  /*----- helper func -----*/
  async findKeyWordById(id: string) {
    return await this.prisma.keyWord.findUnique({
      where: { id },
      include: {
        serviceVendorKeyword: {
          take: 1,
        },
      },
    });
  }

  async checkKeyWordByName({
    vendorTypeId,
    name,
    keyWordType,
    keyWordId,
  }: {
    vendorTypeId: string;
    name: string;
    keyWordType: KeyWordType;
    keyWordId?: string;
  }) {
    return await this.prisma.keyWord.findFirst({
      where: {
        vendorTypeId,
        name,
        keyWordType,
        ...(keyWordId && { id: keyWordId }),
      },
    });
  }

  async checkKeyWordCountForRegistration(
    keyWordIds: string[],
    vendorTypeId: string,
    keyWordType?: KeyWordType,
  ) {
    return await this.prisma.keyWord.count({
      where: {
        id: {
          in: keyWordIds,
        },
        status: 'ACTIVE',
        ...(keyWordType && { keyWordType }),
        vendorTypeId,
      },
    });
  }
}
