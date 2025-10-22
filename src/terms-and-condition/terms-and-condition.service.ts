// terms-and-condition.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetTermsAndConditionQueryDto } from './dto/get-terms-query.dto';
import { buildTermsAndConditionWhereFilter } from './utils/get-terms.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { CreateTermsAndConditionDto } from './dto/create-terms-and-condition-policy.dto';
import { validateCreateTermsAndCondition } from './utils/create-terms.utils';
import { UpdateTermsAndConditionDto } from './dto/update-terms-and-condition.dto';
import { validateUpdateTermsAndCondition } from './utils/update-terms.utils';

@Injectable()
export class TermsAndConditionService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getTermsAndCondition({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetTermsAndConditionQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildTermsAndConditionWhereFilter({ query });

    const totalCount = await this.prismaService.termsAndCondition.count({
      where,
    });

    const termsAndConditions =
      await this.prismaService.termsAndCondition.findMany({
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
      userType: query.userType,
      vendorTypeName: query.vendorTypeName,
      vendorTypeId: query.vendorTypeId,
      type: query.type,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'terms-and-condition',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: termsAndConditions,
      meta,
      message: 'Terms and Conditions retrieved successfully',
      statusCode: 200,
    });
  }

  async createTermsAndCondition({
    res,
    body,
  }: {
    res: Response;
    body: CreateTermsAndConditionDto;
  }) {
    const initialDate = new Date();

    // Validate input and check constraints
    await validateCreateTermsAndCondition(this.prismaService, body);

    const newTermsAndCondition =
      await this.prismaService.termsAndCondition.create({
        data: {
          userType: body.userType,
          vendorTypeId: body.vendorTypeId || null,
          termsAndConditionHtml: body.termsAndConditionHtml,
          termsAndConditionHtmlTa: body.termsAndConditionHtmlTa,
          type: body.type,
        },
        include: {
          vendorType: true,
        },
      });

    return this.responseService.successResponse({
      res,
      data: newTermsAndCondition,
      message: 'Terms and Conditions created successfully',
      statusCode: 201,
      initialDate,
    });
  }

  async updateTermsAndCondition({
    res,
    body,
    termsId,
  }: {
    res: Response;
    termsId: string;
    body: UpdateTermsAndConditionDto;
  }) {
    const initialDate = new Date();

    const termsAndCondition =
      await this.prismaService.termsAndCondition.findUnique({
        where: { id: termsId },
      });

    if (!termsAndCondition) {
      throw new BadRequestException('Terms and Conditions not found');
    }

    // Validate input and check constraints
    await validateUpdateTermsAndCondition(this.prismaService, termsId, body);

    const updatedTermsAndCondition =
      await this.prismaService.termsAndCondition.update({
        where: { id: termsId },
        data: {
          ...(body.userType && { userType: body.userType }),
          ...(body.type && {
            type: body.type,
          }),

          // If CUSTOMER, force null. Else update only if vendorTypeId is provided.
          ...(body.userType === 'CUSTOMER'
            ? { vendorTypeId: null }
            : body.vendorTypeId !== undefined && {
                vendorTypeId: body.vendorTypeId,
              }),

          ...(body.termsAndConditionHtml && {
            termsAndConditionHtml: body.termsAndConditionHtml,
          }),
          ...(body.termsAndConditionHtmlTa && {
            termsAndConditionHtmlTa: body.termsAndConditionHtmlTa,
          }),
        },
        include: {
          vendorType: true,
        },
      });

    return this.responseService.successResponse({
      res,
      data: updatedTermsAndCondition,
      message: 'Terms and Conditions updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteTermsAndCondition({
    termsAndConditionId,
    res,
  }: {
    termsAndConditionId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const termsAndCondition =
      await this.prismaService.termsAndCondition.findUnique({
        where: { id: termsAndConditionId },
      });

    if (!termsAndCondition) {
      throw new BadRequestException('Terms and Conditions not found');
    }

    const deletedTermsAndCondition =
      await this.prismaService.termsAndCondition.delete({
        where: { id: termsAndConditionId },
      });

    return this.responseService.successResponse({
      res,
      data: deletedTermsAndCondition,
      message: 'Terms and Conditions deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
