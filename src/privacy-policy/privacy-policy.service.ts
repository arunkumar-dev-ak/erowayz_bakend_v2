// privacy-policy.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';
import { GetPrivacyPolicyQueryDto } from './dto/get-privacy-policy.dto';
import { MetadataService } from 'src/metadata/metadata.service';
import { buildPrivacyPolicyWhereFilter } from './utils/get-privacy-policy.utils';
import { validateCreatePrivacyPolicy } from './utils/create-privacy-policy.utils';
import { validateUpdatePrivacyPolicy } from './utils/update-privacy-policy.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class PrivacyPolicyService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getPrivacyPolicy({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetPrivacyPolicyQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildPrivacyPolicyWhereFilter({ query });

    const totalCount = await this.prismaService.privacyPolicy.count({
      where,
    });

    const privacyPolicies = await this.prismaService.privacyPolicy.findMany({
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
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'privacy-policy',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: privacyPolicies,
      meta,
      message: 'Privacy policies retrieved successfully',
      statusCode: 200,
    });
  }

  async createPrivacyPolicy({
    res,
    body,
  }: {
    res: Response;
    body: CreatePrivacyPolicyDto;
  }) {
    const initialDate = new Date();

    // Validate input and check constraints
    await validateCreatePrivacyPolicy(this.prismaService, body);

    const newPrivacyPolicy = await this.prismaService.privacyPolicy.create({
      data: {
        userType: body.userType,
        vendorTypeId: body.vendorTypeId || null,
        privacyPolicyHtml: body.privacyPolicyHtml,
        privacyPolicyHtmlTa: body.privacyPolicyHtmlTa,
        type: body.type || null,
      },
      include: {
        vendorType: true,
      },
    });

    return this.responseService.successResponse({
      res,
      data: newPrivacyPolicy,
      message: 'Privacy policy created successfully',
      statusCode: 201,
      initialDate,
    });
  }

  async updatePrivacyPolicy({
    res,
    body,
    privacyPolicyId,
  }: {
    res: Response;
    body: UpdatePrivacyPolicyDto;
    privacyPolicyId: string;
  }) {
    const initialDate = new Date();

    // Validate input and check constraints
    await validateUpdatePrivacyPolicy(
      this.prismaService,
      privacyPolicyId,
      body,
    );

    const updatedPrivacyPolicy = await this.prismaService.privacyPolicy.update({
      where: { id: privacyPolicyId },
      data: {
        ...(body.userType && { userType: body.userType }),
        ...(body.type && { type: body.type }),

        // If CUSTOMER, force null. Else update only if vendorTypeId is provided.
        ...(body.userType === 'CUSTOMER'
          ? { vendorTypeId: null }
          : body.vendorTypeId !== undefined && {
              vendorTypeId: body.vendorTypeId,
            }),
        ...(body.privacyPolicyHtml && {
          privacyPolicyHtml: body.privacyPolicyHtml,
        }),
        ...(body.privacyPolicyHtmlTa && {
          privacyPolicyHtmlTa: body.privacyPolicyHtmlTa,
        }),
      },
      include: {
        vendorType: true,
      },
    });

    return this.responseService.successResponse({
      res,
      data: updatedPrivacyPolicy,
      message: 'Privacy policy updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deletePrivacyPolicy({
    privacyPolicyId,
    res,
  }: {
    privacyPolicyId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const privacyPolicy = await this.prismaService.privacyPolicy.findUnique({
      where: { id: privacyPolicyId },
    });

    if (!privacyPolicy) {
      throw new BadRequestException('Privacy policy not found');
    }

    const deletedPrivacyPolicy = await this.prismaService.privacyPolicy.delete({
      where: { id: privacyPolicyId },
    });

    return this.responseService.successResponse({
      res,
      data: deletedPrivacyPolicy,
      message: 'Privacy policy deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
