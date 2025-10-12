import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateVendorSubscriptionDto } from './dto/create-vendor-sub.dto';
import { Response } from 'express';
import { SubscriptionService } from 'src/subscription/subscription.service';
import {
  Payment,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  SubscriptionPlan,
  User,
  Vendor,
  VendorSubscription,
} from '@prisma/client';
import { initiateVendorSubscriptionVerification } from './utils/initiate-vendor-sub.utils';
import { JuspayOrderResponse } from 'src/payment/dto/juspay-webhook.dto';
import { PaymentJuspayService } from 'src/payment/payment.juspay.service';
import { ManualRefundService } from 'src/manual-refund/manual-refund.service';
import {
  calculateEndDate,
  checkCurrentAndFutureSubscription,
  getSubscriptionPlanOrThrow,
} from './utils/create-vendor-sub-utils';
import { GetVendorSubscriptionQueryForAdmin } from './dto/get-vendor-sub.query.dto';
import { buildVendorSubWhereFilter } from './utils/get-vendor-sub.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { MetadataService } from 'src/metadata/metadata.service';
import { PaymentError } from 'src/payment/utils/payment-error.utils';

@Injectable()
export class VendorSubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => PaymentJuspayService))
    private readonly paymentJuspayService: PaymentJuspayService,
    private readonly manualRefundService: ManualRefundService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getVendorSubscriptionForAdmin({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetVendorSubscriptionQueryForAdmin;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();
    const where = buildVendorSubWhereFilter({
      query,
    });

    const totalCount = await this.prisma.vendorSubscription.count({ where });

    const vendorSubscription = await this.prisma.vendorSubscription.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendor: {
          include: {
            User: true,
          },
        },
      },
      orderBy: [{ isActive: 'desc' }, { endDate: 'desc' }],
    });

    const queries = buildQueryParams({
      isActive: query.isActive,
      subscriptionName: query.subscriptionName,
      vendorId: query.vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor-subscription',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: vendorSubscription,
      meta,
      message: 'Vendor Subscriptions retrieved successfully',
      statusCode: 200,
    });
  }

  async getVendorSubscriptionforVendor({
    vendorId,
    res,
  }: {
    vendorId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const currentVendorSubscription = await this.checkCurrentVendorSubscription(
      { vendorId },
    );

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'Current subscription fetched sucessfully',
      data: currentVendorSubscription,
      statusCode: 200,
    });
  }

  async getCurrentAndFutureSubOfVendor({
    vendorId,
    res,
  }: {
    vendorId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const currentVendorSubscription = await this.checkCurrentVendorSubscription(
      { vendorId },
    );
    const futureVendorSubscription = await this.checkFutureVendorSubscription({
      vendorId,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'Current subscription fetched sucessfully',
      data: { currentVendorSubscription, futureVendorSubscription },
      statusCode: 200,
    });
  }

  async initiateVendorSubscription({
    body,
    res,
    vendor,
    user,
  }: {
    body: CreateVendorSubscriptionDto;
    res: Response;
    vendor: Vendor;
    user: User;
  }) {
    const initialDate = new Date();

    try {
      const { subPlan, existingSubscriptionPlan, futureVendorSubscription } =
        await initiateVendorSubscriptionVerification({
          currentDate: initialDate,
          body,
          subscriptionService: this.subscriptionService,
          vendor,
          vendorSubscriptionService: this,
          user,
        });

      //handle amount zero
      if (subPlan.discountPrice === 0) {
        const vendorSubscriptionPlan =
          await this.createVendorSubscriptionForZeroAmount({
            vendorId: vendor.id,
            subPlan,
            existingSubscriptionPlan,
            futureVendorSubscription,
          });
        return this.responseService.successResponse({
          initialDate,
          data: vendorSubscriptionPlan,
          res,
          message: 'Subscrition processed successfully',
          statusCode: 200,
        });
      }

      const jusPayOrder: JuspayOrderResponse | undefined =
        await this.paymentJuspayService.createOrder({
          amount: subPlan.discountPrice || subPlan.price,
          user,
          referenceId: subPlan.id,
          paymentPurpose: PaymentPurpose.SUBSCRIPTION_PURCHASE,
        });

      if (!jusPayOrder) {
        return;
      }

      const payment = await this.prisma.payment.create({
        data: {
          juspayOrderId: jusPayOrder.id,
          orderId: jusPayOrder.order_id,
          amount: subPlan.discountPrice || subPlan.price,
          purpose: PaymentPurpose.SUBSCRIPTION_PURCHASE,
          referenceId: subPlan.id,
          status: 'PENDING',
          userId: vendor.userId,
          paymentLinkWeb: jusPayOrder.payment_links.web,
          paymentPageExpiry: new Date(jusPayOrder.payment_links.expiry),
        },
      });

      return this.responseService.successResponse({
        initialDate,
        data: { ...payment, ...jusPayOrder.sdk_payload },
        res,
        message: 'Payment initiated successfully',
        statusCode: 200,
      });
    } catch (err) {
      console.log(err);
      //need to create an error log
      throw err;
    }
  }

  /*----- Create vendor subscription -----*/
  async createVendorSubscription({
    payment,
    vendorId,
    tx,
  }: {
    payment: Payment;
    vendorId: string;
    tx?: Prisma.TransactionClient;
  }) {
    const now = new Date();

    const plan = await getSubscriptionPlanOrThrow(
      payment.referenceId,
      this.subscriptionService,
    );

    // if (typeof plan === 'string') {
    //   await createManualRefund({
    //     payment,
    //     reason: plan,
    //     prismaService: this.prisma,
    //     tx,
    //     userId,
    //   });

    //   return;
    // }

    const { existingSubscriptionPlan, futureVendorSubscription } =
      await checkCurrentAndFutureSubscription({
        vendorSubscriptionService: this,
        vendorId,
      });
    if (existingSubscriptionPlan && futureVendorSubscription) {
      throw new PaymentError(
        'You already have an active and an upcoming subscription. New subscription cannot be created.',
        false,
        'Active and future subscription conflict',
        {
          existingSubscriptionPlan,
          futureVendorSubscription,
        },
      );
    } else if (existingSubscriptionPlan && !futureVendorSubscription) {
      const endDate = calculateEndDate(
        existingSubscriptionPlan.endDate,
        plan.billingPeriod,
      );

      return this.createSubscriptionEntry({
        payment,
        plan,
        startDate: existingSubscriptionPlan.endDate,
        endDate,
        vendorId,
        tx,
      });
    } else {
      const endDate = calculateEndDate(now, plan.billingPeriod);

      return this.createSubscriptionEntry({
        payment,
        plan,
        startDate: now,
        endDate,
        vendorId,
        tx,
      });
    }
  }

  /*----- handling zero amount -----*/
  createVendorSubscriptionForZeroAmount = async ({
    subPlan,
    vendorId,
    existingSubscriptionPlan,
    futureVendorSubscription,
    tx,
  }: {
    subPlan: SubscriptionPlan;
    existingSubscriptionPlan?: VendorSubscription | null;
    futureVendorSubscription?: VendorSubscription | null;
    vendorId: string;
    tx?: Prisma.TransactionClient;
  }) => {
    const now = new Date();

    if (existingSubscriptionPlan && futureVendorSubscription) {
      throw new PaymentError(
        'You already have an active and an upcoming subscription. New subscription cannot be created.',
        false,
        'Active and future subscription conflict',
        {
          existingSubscriptionPlan,
          futureVendorSubscription,
        },
      );
    } else if (existingSubscriptionPlan && !futureVendorSubscription) {
      const endDate = calculateEndDate(
        existingSubscriptionPlan.endDate,
        subPlan.billingPeriod,
      );

      return this.createSubscriptionEntry({
        plan: subPlan,
        startDate: existingSubscriptionPlan.endDate,
        endDate,
        vendorId,
        tx,
      });
    } else {
      const endDate = calculateEndDate(now, subPlan.billingPeriod);

      return this.createSubscriptionEntry({
        plan: subPlan,
        startDate: now,
        endDate,
        vendorId,
        tx,
      });
    }
  };

  private async createSubscriptionEntry({
    payment,
    plan,
    startDate,
    endDate,
    vendorId,
    tx,
  }: {
    payment?: Payment;
    plan: SubscriptionPlan;
    startDate: Date;
    endDate: Date;
    tx?: Prisma.TransactionClient;
    vendorId: string;
  }) {
    const prisma = tx ?? this.prisma;

    const newVendorSubscription = await prisma.vendorSubscription.create({
      data: {
        vendorId,
        paymentId: payment ? payment.id : undefined,
        planId: plan.id,
        planName: plan.name,
        planFeatures: plan.features
          ? (plan.features as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        planBillingPeriod: plan.billingPeriod,
        planPrice: plan.price,
        planDiscountPrice: plan.discountPrice,
        startDate,
        endDate,
      },
    });

    return newVendorSubscription;
  }

  /*----- helper func -----*/

  async checkCurrentVendorSubscription({ vendorId }: { vendorId: string }) {
    const currentDate = new Date();
    return await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId,
        isActive: true,
        startDate: { lte: currentDate },
        endDate: { gt: currentDate },
      },
      include: {
        vendor: {
          include: {
            User: true,
          },
        },
        plan: true,
      },
    });
  }

  async checkCurrentVendorSubscriptionForPlanFeatures({
    vendorId,
  }: {
    vendorId: string;
  }) {
    const currentDate = new Date();
    const currentSub = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId,
        isActive: true,
        startDate: { lte: currentDate },
        endDate: { gt: currentDate },
      },
      include: {
        vendor: {
          include: {
            User: true,
          },
        },
        plan: true,
      },
    });
    if (!currentSub || !currentSub.planFeatures) {
      throw new BadRequestException(
        'Currently vendor not accepting order.Try again sometime',
      );
    }
    return currentSub;
  }

  async checkFutureVendorSubscription({ vendorId }: { vendorId: string }) {
    const currentDate = new Date();
    return await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId,
        isActive: true,
        startDate: { gt: currentDate },
        endDate: { gt: currentDate },
      },
      include: {
        vendor: {
          include: {
            User: true,
          },
        },
      },
    });
  }

  async checkVendoreSubscriptionByPaymentId(paymentId: string) {
    return await this.prisma.vendorSubscription.findUnique({
      where: {
        paymentId,
      },
      include: {
        vendor: true,
      },
    });
  }

  async checkVendorSubInitiationCount(userId: string) {
    const currentDate = new Date();

    const payments = await this.prisma.payment.count({
      where: {
        userId,
        purpose: PaymentPurpose.SUBSCRIPTION_PURCHASE,
        status: PaymentStatus.PENDING,
        paymentPageExpiry: {
          gt: currentDate,
        },
      },
    });
    return payments;
  }

  async getOrCreateFeatureUsage({
    vendorSubscriptionId,
    itemId,
    feature,
    shopId,
  }: {
    vendorSubscriptionId: string;
    itemId?: string;
    feature: string;
    shopId?: string;
  }) {
    const whereFilter: Prisma.VendorFeatureUsageWhereInput = {
      vendorSubscriptionId,
      feature,
    };

    if (itemId) {
      whereFilter.itemId = itemId;
    }
    if (shopId) {
      whereFilter.shopId = shopId;
    }

    const vendorFeatureUsage = await this.prisma.vendorFeatureUsage.findFirst({
      where: whereFilter,
      include: {
        vendorSubscription: true,
      },
    });

    if (vendorFeatureUsage) {
      return vendorFeatureUsage;
    }

    const createFeatureUsage: Prisma.VendorFeatureUsageCreateInput = {
      vendorSubscription: {
        connect: {
          id: vendorSubscriptionId,
        },
      },
      feature,
      ...(shopId && {
        shopInfo: {
          connect: {
            id: shopId,
          },
        },
      }),
      ...(itemId && {
        item: {
          connect: {
            id: itemId,
          },
        },
      }),
    };

    const newVendorFeatureUsage = await this.prisma.vendorFeatureUsage.create({
      data: createFeatureUsage,
      include: {
        vendorSubscription: true,
      },
    });

    return newVendorFeatureUsage;
  }
}
