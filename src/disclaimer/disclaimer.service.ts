import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateDisclaimerDto } from './dto/create-disclaimer.dto';
import { UpdateDisclaimerDto } from './dto/update-disclaimer.dto';
import { buildDiscalimerWhereFilter } from './utils/get-disclaimer.utils';
import { GetDisclaimerQueryDto } from './dto/get-discalimer.dto';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class DisclaimerService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getDisclaimer({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetDisclaimerQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildDiscalimerWhereFilter({
      query,
    });

    const count = await this.prismaService.disclaimer.count({
      where,
    });

    const disclaimers = await this.prismaService.disclaimer.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    const queries = buildQueryParams({
      disclaimerType: query.disclaimerType,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount: count,
      offset,
      limit,
      path: 'disclaimer',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: disclaimers,
      message: 'Disclaimers retrieved successfully',
      statusCode: 200,
      meta,
    });
  }

  async createDisclaimer({
    res,
    body,
  }: {
    res: Response;
    body: CreateDisclaimerDto;
  }) {
    const initialDate = new Date();

    // Check if disclaimer with same type already exists
    const existingDisclaimer = await this.prismaService.disclaimer.findFirst({
      where: {
        disclaimerType: body.disclaimerType,
      },
    });

    if (existingDisclaimer) {
      throw new BadRequestException(
        `Disclaimer of type '${body.disclaimerType}' already exists`,
      );
    }

    const newDisclaimer = await this.prismaService.disclaimer.create({
      data: {
        disclaimerType: body.disclaimerType,
        disclaimerHtml: body.disclaimerHtml,
        disclaimerHtmlTa: body.disclaimerHtmlTa,
      },
    });

    return this.responseService.successResponse({
      res,
      data: newDisclaimer,
      message: 'Disclaimer Created Successfully',
      statusCode: 201,
      initialDate,
    });
  }

  async updateDisclaimer({
    res,
    id,
    body,
  }: {
    res: Response;
    id: string;
    body: UpdateDisclaimerDto;
  }) {
    const initialDate = new Date();

    const disclaimer = await this.prismaService.disclaimer.findUnique({
      where: { id },
    });

    if (!disclaimer) {
      throw new BadRequestException('Disclaimer Not Found');
    }

    // If updating disclaimerType, check for conflicts
    if (
      body.disclaimerType &&
      body.disclaimerType !== disclaimer.disclaimerType
    ) {
      const conflictingDisclaimer =
        await this.prismaService.disclaimer.findFirst({
          where: {
            disclaimerType: body.disclaimerType,
            id: { not: id },
          },
        });

      if (conflictingDisclaimer) {
        throw new BadRequestException(
          `Disclaimer of type '${body.disclaimerType}' already exists`,
        );
      }
    }

    const updatedDisclaimer = await this.prismaService.disclaimer.update({
      where: { id },
      data: {
        ...(body.disclaimerType && { disclaimerType: body.disclaimerType }),
        ...(body.disclaimerHtml && { disclaimerHtml: body.disclaimerHtml }),
        ...(body.disclaimerHtmlTa && {
          disclaimerHtmlTa: body.disclaimerHtmlTa,
        }),
      },
    });

    return this.responseService.successResponse({
      res,
      data: updatedDisclaimer,
      message: 'Disclaimer Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteDisclaimer({
    disclaimerId,
    res,
  }: {
    disclaimerId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const disclaimer = await this.prismaService.disclaimer.findUnique({
      where: { id: disclaimerId },
    });

    if (!disclaimer) {
      throw new BadRequestException('Disclaimer Not Found');
    }

    const deletedDisclaimer = await this.prismaService.disclaimer.delete({
      where: { id: disclaimerId },
    });

    return this.responseService.successResponse({
      res,
      data: deletedDisclaimer,
      message: 'Disclaimer Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
