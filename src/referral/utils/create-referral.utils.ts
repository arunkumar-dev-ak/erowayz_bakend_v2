import { BadRequestException } from '@nestjs/common';
import { ReferralService } from '../referral.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

export const CreateReferralUtils = async ({
  code,
  referralCodeUsageLimit,
  referralService,
  vendorSubscriptionService,
}: {
  code: string;
  referralCodeUsageLimit: number;
  referralService: ReferralService;
  vendorSubscriptionService: VendorSubscriptionService;
}) => {
  //check referral code validity
  //check the no of time referralCode is Used
  //check the target user current and future subscription
  //create a future subscription

  const referralCode = await referralService.checkReferralCode({
    referralCode: code,
  });

  if (
    !referralCode ||
    referralCode.status === false ||
    referralCode.referees.length >= referralCodeUsageLimit ||
    !referralCode.vendor
  ) {
    throw new BadRequestException('Referral Code is invalid');
  }

  const [currentSubscription, futureSubscription] = await Promise.all([
    vendorSubscriptionService.checkCurrentVendorSubscription({
      vendorId: referralCode.vendor.id,
    }),
    vendorSubscriptionService.checkFutureVendorSubscription({
      vendorId: referralCode.vendor.id,
    }),
  ]);

  if (!currentSubscription) {
    throw new BadRequestException(
      "Vendor Can't able to refer,Because he had no active plans",
    );
  }

  const plan = currentSubscription.plan;
  if (!plan || plan.status === 'INACTIVE') {
    throw new BadRequestException(
      'Vendor current Subscription plan is invalid.So You cant use that referral code',
    );
  }

  return { currentSubscription, futureSubscription, plan };
};
