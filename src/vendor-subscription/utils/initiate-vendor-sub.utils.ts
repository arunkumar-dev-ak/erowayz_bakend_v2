import { SubscriptionService } from 'src/subscription/subscription.service';
import { CreateVendorSubscriptionDto } from '../dto/create-vendor-sub.dto';
import { BadRequestException } from '@nestjs/common';
import { User, Vendor } from '@prisma/client';
import { VendorSubscriptionService } from '../vendor-subscription.service';
import { convertUTCToISTFormatted } from 'src/common/functions/utils';

export const initiateVendorSubscriptionVerification = async ({
  currentDate,
  body,
  subscriptionService,
  vendor,
  vendorSubscriptionService,
  user,
}: {
  currentDate: Date;
  body: CreateVendorSubscriptionDto;
  subscriptionService: SubscriptionService;
  vendorSubscriptionService: VendorSubscriptionService;
  vendor: Vendor;
  user: User;
}) => {
  const { subscriptionPlanId } = body;

  const subPlan = await subscriptionService.getSubPlanById(subscriptionPlanId);

  const maxInitiationCount = parseInt(
    process.env.SUBSCRIPTION_INITIATION_COUNT ?? '1',
  );

  // Check if vendor has exceeded subscription initiation attempts
  if (
    maxInitiationCount > 0 &&
    (await vendorSubscriptionService.checkVendorSubInitiationCount(user.id)) >
      maxInitiationCount
  ) {
    throw new BadRequestException(
      'You have exceeded the limit for subscription payment initiation. Please try again after 5 minutes.',
    );
  }

  if (!subPlan) {
    //checking sub plan
    throw new BadRequestException(
      'Apologies, the selected plan was not found.',
    );
  } else if (subPlan.status === 'INACTIVE') {
    throw new BadRequestException(
      'Apologies, the selected plan is currently unavailable.',
    );
  }

  //checking plan match the vendor vendorType
  if (subPlan.vendorTypeId !== vendor.vendorTypeId) {
    throw new BadRequestException(
      `Apologies, the selected plan is associated with the ${subPlan.vendorType.name}.`,
    );
  }

  //checking if subscription is already presented
  const [existingSubscriptionPlan, futureVendorSubscription] =
    await Promise.all([
      vendorSubscriptionService.checkCurrentVendorSubscription({
        vendorId: vendor.id,
      }),
      vendorSubscriptionService.checkCurrentVendorSubscription({
        vendorId: vendor.id,
      }),
    ]);

  if (futureVendorSubscription) {
    throw new BadRequestException(
      `You currently have an stacked subscription valid until ${convertUTCToISTFormatted(futureVendorSubscription.endDate)}. Please wait until it expires to subscribe again.`,
    );
  }

  const oneDayAgo = currentDate;
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  if (
    existingSubscriptionPlan &&
    existingSubscriptionPlan.endDate < oneDayAgo
  ) {
    throw new BadRequestException(
      `You are allowed to renew the subscription only one day before it expires on ${convertUTCToISTFormatted(
        existingSubscriptionPlan.endDate,
      )}.`,
    );
  }

  return { subPlan };
};
