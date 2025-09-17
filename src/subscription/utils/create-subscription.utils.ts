import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { BadRequestException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { SubscriptionService } from '../subscription.service';
import { capitalize } from 'lodash';

export const CreateSubscriptionValidation = async ({
  body,
  vendorTypeService,
  subscriptionService,
}: {
  body: CreateSubscriptionDto;
  vendorTypeService: VendorTypeService;
  subscriptionService: SubscriptionService;
}) => {
  const { vendorTypeId, features, name, billingPeriod } = body;

  //Validate vendorTypeId
  const vendorType = await vendorTypeService.findVendorTypeById(
    body.vendorTypeId,
  );
  if (!vendorType) {
    throw new BadRequestException('Invalid vendorTypeId');
  }

  //validate name
  if (
    await subscriptionService.getSubscriptionByPlanAndVendorType(
      vendorTypeId,
      name,
      billingPeriod,
    )
  ) {
    throw new BadRequestException(
      `${name} already presents for ${vendorType.name} on ${capitalize(billingPeriod)} period.Try a different name`,
    );
  }

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
};
