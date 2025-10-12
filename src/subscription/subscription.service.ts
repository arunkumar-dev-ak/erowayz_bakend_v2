import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { ServiceOptionService } from 'src/service-option/service-option.service';
import { CreateSubscriptionValidation } from './utils/create-subscription.utils';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateSubscriptionPlanVerification } from './utils/update-subscription.utils';
import { ChangeSubScriptionStatus } from './dto/change-subscription-status.dto';
import { GetSubscriptionPlanQueryDto } from './dto/get-subscription-query.dto';
import { buildSubscriptionPlanWhereFilter } from './utils/get-subscription.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { BillingPeriod } from '@prisma/client';
import { GetSubTransactionQueryForAdminDto } from './dto/get-sub-transaction-query.dto';
import { buildSubTransactiontWhereFilter } from './utils/get-sub-transaction.utils';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly vendorTypeService: VendorTypeService,
    private readonly serviceOptionService: ServiceOptionService,
  ) {}

  async getSubscription({
    res,
    query,
    offset,
    limit,
  }: {
    query: GetSubscriptionPlanQueryDto;
    res: Response;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildSubscriptionPlanWhereFilter({ query });

    const totalCount = await this.prisma.subscriptionPlan.count({ where });

    const subscriptionPlans = await this.prisma.subscriptionPlan.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendorType: true,
      },
      orderBy: [
        {
          vendorType: {
            name: 'asc',
          },
        },
        {
          price: 'asc',
        },
      ],
    });

    // Step 4: Construct query params
    const queries = buildQueryParams({
      vendorTypeId: query.vendorTypeId,
      subscriptionName: query.subscriptionName,
      subscriptionPlanId: query.subscriptionPlanId,
      billingPeriod: query.billingPeriod,
      status: query.status,
      vendorCategoryType: query.vendorCategoryType,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'subscription',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: subscriptionPlans,
      meta,
      message: 'Subscription plans retrieved successfully',
      statusCode: 200,
    });
  }

  async getSubTransaction({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetSubTransactionQueryForAdminDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();
    const { where } = buildSubTransactiontWhereFilter({
      query,
    });

    const totalCount = await this.prisma.payment.count({ where });

    const walletTransaction = await this.prisma.payment.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        vendorSubscription: {
          include: {
            vendor: {
              include: {
                shopInfo: true,
                User: {
                  select: {
                    name: true,
                    nameTamil: true,
                  },
                },
              },
            },
            plan: true,
          },
        },
      },
    });

    const { shopName, vendorId, userId, userName, startDate, endDate } = query;
    const queries = buildQueryParams({
      shopName,
      vendorId,
      userId,
      userName,
      startDate,
      endDate,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `subscription/transaction`,
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: walletTransaction,
      meta,
      message: 'Subscription Transaction retrieved successfully',
      statusCode: 200,
    });
  }

  async createSubscription({
    res,
    body,
  }: {
    res: Response;
    body: CreateSubscriptionDto;
  }) {
    const initialDate = new Date();

    await CreateSubscriptionValidation({
      body,
      vendorTypeService: this.vendorTypeService,
      subscriptionService: this,
    });

    const {
      name,
      price,
      billingPeriod,
      vendorTypeId,
      gradientEnd,
      gradientStart,
      status,
      features,
      discountPrice,
    } = body;

    const subscriptionPlan = await this.prisma.subscriptionPlan.create({
      data: {
        name,
        price,
        billingPeriod,
        features,
        status: status ?? 'INACTIVE',
        gradientEnd,
        gradientStart,
        vendorTypeId,
        discountPrice,
      },
    });

    return this.responseService.successResponse({
      res,
      data: subscriptionPlan,
      message: 'Subscription created successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateSubscription({
    body,
    res,
    subPlanId,
  }: {
    body: UpdateSubscriptionDto;
    res: Response;
    subPlanId: string;
  }) {
    const initialDate = new Date();

    //verification
    const { updateData } = await UpdateSubscriptionPlanVerification({
      body,
      subPlanId,
      vendorTypeService: this.vendorTypeService,
      subscriptionService: this,
    });

    const updatedSubscriptionPlan = await this.prisma.subscriptionPlan.update({
      where: {
        id: subPlanId,
      },
      data: updateData,
    });

    return this.responseService.successResponse({
      res,
      data: updatedSubscriptionPlan,
      message: 'Subscription updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async changeSubScriptionStatus({
    res,
    body,
    subPlanId,
  }: {
    res: Response;
    body: ChangeSubScriptionStatus;
    subPlanId: string;
  }) {
    const initialDate = new Date();

    const subscriptionPlan = await this.getSubPlanById(subPlanId);
    if (!subscriptionPlan) {
      throw new BadRequestException('Subscription plan not flound');
    }

    const updatedSubscriptionPlan = await this.prisma.subscriptionPlan.update({
      where: {
        id: subPlanId,
      },
      data: {
        status: body.status,
      },
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      data: updatedSubscriptionPlan,
      message: 'Subscription plan updated successfully',
      statusCode: 200,
    });
  }

  async deleteSubScriptionPlan({
    res,
    subPlanId,
  }: {
    res: Response;
    subPlanId: string;
  }) {
    const initialDate = new Date();

    const subscriptionPlan = await this.getSubPlanById(subPlanId);
    if (!subscriptionPlan) {
      throw new BadRequestException('Subscription plan not flound');
    }

    const deletedSubscriptionPlan = await this.prisma.subscriptionPlan.delete({
      where: {
        id: subPlanId,
      },
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      data: deletedSubscriptionPlan,
      message: 'Subscription plan deleted successfully',
      statusCode: 200,
    });
  }

  /*----- helper -----*/
  async getSubscriptionByPlanAndVendorType(
    vendorTypeId: string,
    name: string,
    billingPeriod: BillingPeriod,
  ) {
    return await this.prisma.subscriptionPlan.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        vendorTypeId,
        billingPeriod,
      },
    });
  }

  async getSubPlanById(subPlanId: string) {
    return await this.prisma.subscriptionPlan.findUnique({
      where: {
        id: subPlanId,
      },
      include: {
        vendorType: true,
      },
    });
  }
}
