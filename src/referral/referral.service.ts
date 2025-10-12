import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateReferralUtils } from './utils/create-referral.utils';
import { calculateEndDate } from 'src/vendor-subscription/utils/create-vendor-sub-utils';
import { Prisma } from '@prisma/client';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

@Injectable()
export class ReferralService {
  private readonly referralCodeUsageLimit: number;
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly configService: ConfigService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {
    this.referralCodeUsageLimit = parseInt(
      configService.get<string>('REFERRAL_CODE_USAGE_LIMIT') || '1',
    );
  }

  async getSubInfoForReferral({
    referralCode,
    isQueryNeeded,
  }: {
    referralCode: string;
    isQueryNeeded: boolean;
  }) {
    /*----- validation check -----*/
    const { currentSubscription, plan } = await CreateReferralUtils({
      code: referralCode,
      referralCodeUsageLimit: this.referralCodeUsageLimit,
      referralService: this,
      vendorSubscriptionService: this.vendorSubscriptionService,
    });

    if (isQueryNeeded) {
      const endDate = calculateEndDate(
        currentSubscription.endDate,
        currentSubscription.planBillingPeriod,
      );

      const createVendorSubscriptionQuery: Prisma.VendorSubscriptionCreateInput =
        {
          vendor: { connect: { id: currentSubscription.vendorId } },
          plan: { connect: { id: plan.id } },
          planName: plan.name,
          planFeatures: plan.features
            ? (plan.features as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          planBillingPeriod: plan.billingPeriod,
          planPrice: plan.price,
          planDiscountPrice: plan.discountPrice,
          startDate: currentSubscription.endDate,
          endDate,
        };

      return { createVendorSubscriptionQuery };
    }
  }

  /*----- helper func -----*/
  async checkReferralCode({ referralCode }: { referralCode: string }) {
    return await this.prismaService.user.findUnique({
      where: {
        referralCode,
      },
      include: {
        referrer: true,
        referees: true,
        vendor: true,
      },
    });
  }
}
