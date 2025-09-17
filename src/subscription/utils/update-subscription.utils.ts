import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { SubscriptionService } from '../subscription.service';
import { BadRequestException } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';

export const UpdateSubscriptionPlanVerification = async ({
  body,
  subPlanId,
  vendorTypeService,
  subscriptionService,
}: {
  body: UpdateSubscriptionDto;
  subPlanId: string;
  vendorTypeService: VendorTypeService;
  subscriptionService: SubscriptionService;
}) => {
  const { name, price, discountPrice, vendorTypeId, features, billingPeriod } =
    body;

  //validate subPlan
  const subscriptionPlan = await subscriptionService.getSubPlanById(subPlanId);
  if (!subscriptionPlan) {
    throw new BadRequestException('Subscription plan not found');
  }

  //Validate vendorTypeId
  if (vendorTypeId) {
    const vendorType = await vendorTypeService.findVendorTypeById(vendorTypeId);
    if (!vendorType) {
      throw new BadRequestException('Invalid vendorTypeId');
    }
  }

  //validate name
  if (name) {
    const existingSubPlanName =
      await subscriptionService.getSubscriptionByPlanAndVendorType(
        vendorTypeId ?? subscriptionPlan.vendorTypeId,
        name,
        billingPeriod ?? subscriptionPlan.billingPeriod,
      );
    if (existingSubPlanName && existingSubPlanName.id !== subPlanId) {
      throw new BadRequestException(
        `${name} already presents for the existing vendor type.Try a different name`,
      );
    }
  }

  // Check price and discount price validity
  if (price !== undefined || discountPrice !== undefined) {
    const currentPrice = price ?? subscriptionPlan.price;
    const currentDiscountPrice =
      discountPrice ?? subscriptionPlan.discountPrice;
    if (currentDiscountPrice) {
      if (currentPrice === 0 && currentDiscountPrice !== 0) {
        throw new BadRequestException(
          'Discount price must be 0 if the original price is 0',
        );
      }

      if (currentDiscountPrice >= currentPrice) {
        throw new BadRequestException(
          'Discount price must be less than the original price',
        );
      }
    }
  }

  //validate service option if present
  if (features) {
    //validate payment
    const paymentModes = features['paymentModes'] as string[] | undefined;
    if (paymentModes) {
      const validModes = Object.values(PaymentMethod) as string[];

      const invalidModes = paymentModes.filter(
        (mode) => !validModes.includes(mode),
      );

      if (invalidModes.length > 0) {
        throw new BadRequestException(
          `Invalid payment modes: ${invalidModes.join(', ')}. Allowed values: ${validModes.join(', ')}`,
        );
      }
    }
  }

  const updateData: Prisma.SubscriptionPlanUpdateInput = {
    name: name ?? undefined,
    price: price ?? undefined,
    discountPrice: discountPrice ?? undefined,
    vendorType: vendorTypeId ? { connect: { id: vendorTypeId } } : undefined,
    features: features ?? undefined,
    updatedAt: new Date(),
  };

  if (body.gradientStart !== undefined) {
    updateData.gradientStart = body.gradientStart;
  }

  if (body.gradientEnd !== undefined) {
    updateData.gradientEnd = body.gradientEnd;
  }

  if (body.status !== undefined) {
    updateData.status = body.status;
  }

  return { subscriptionPlan, updateData };
};
