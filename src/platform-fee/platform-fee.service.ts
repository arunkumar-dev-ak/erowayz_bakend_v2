import { BadRequestException, Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreatePlatformFeeDto } from './dto/create-platform-fee.dto';
import { Response } from 'express';
import { CreatePlatformUtilsUtils } from './utils/create-platform-fee.utils';
import { GetPlatformFeeQueryDto } from './dto/get-platform-fee.dto';
import { buildPlatformFeeWhereFilter } from './utils/get-platform-fee.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { UpdatePlatformFeeDto } from './dto/update-platform-fee.dto';
import { UpdatePlatformFeeUtils } from './utils/update-platform-fee.utils';

@Injectable()
export class PlatformFeeService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getPlatformFee({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetPlatformFeeQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildPlatformFeeWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.platformFees.count({
      where,
    });

    const platformFees = await this.prismaService.platformFees.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      amount: query.amount?.toString(),
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'platform-fee',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: platformFees,
      meta,
      message: 'Platform Fees retrieved successfully',
      statusCode: 200,
    });
  }

  async createPlatformFees({
    body,
    res,
  }: {
    body: CreatePlatformFeeDto;
    res: Response;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery } = await CreatePlatformUtilsUtils({
      body,
      platformFeeService: this,
    });

    const newPlatformFee = await this.prismaService.platformFees.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newPlatformFee,
      message: 'PlatformFee Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updatePlatformFee({
    body,
    res,
    platformFeeId,
  }: {
    body: UpdatePlatformFeeDto;
    res: Response;
    platformFeeId: string;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { updateQuery } = await UpdatePlatformFeeUtils({
      body,
      platformFeeService: this,
      platformFeeId,
    });

    const updatedCity = await this.prismaService.platformFees.update({
      where: {
        id: platformFeeId,
      },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedCity,
      message: 'PlatformFee Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deletePlatformFee({
    platformFeeId,
    res,
  }: {
    platformFeeId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const existingPlatformFee = await this.checkPlatformfeeById(platformFeeId);
    if (!existingPlatformFee) {
      throw new BadRequestException('Platform fee not found');
    }

    const deletePlatformFee = await this.prismaService.platformFees.delete({
      where: {
        id: platformFeeId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deletePlatformFee,
      message: 'Platform Fees Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async checkPlatformfeeById(id: string) {
    return this.prismaService.platformFees.findUnique({
      where: {
        id,
      },
    });
  }

  async checkFeeByRange({
    startAmount,
    endAmount,
    id,
  }: {
    startAmount: number;
    endAmount: number;
    id?: string;
  }) {
    const platformFee = await this.prismaService.platformFees.findMany({
      where: {
        AND: [
          {
            startAmount: {
              lte: endAmount,
            },
          },
          {
            endAmount: {
              gte: startAmount,
            },
          },
        ],
        ...(id && {
          NOT: {
            id,
          },
        }),
      },
    });

    return platformFee;
  }

  async getFeesForOrdering({ amount }: { amount: number }) {
    return await this.prismaService.platformFees.findFirst({
      where: {
        startAmount: {
          gte: amount,
        },
        endAmount: {
          lte: amount,
        },
      },
    });
  }
}
