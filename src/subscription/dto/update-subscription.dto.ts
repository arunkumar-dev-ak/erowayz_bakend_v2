import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
  Matches,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { BillingPeriod, Status } from '@prisma/client';

@ValidatorConstraint({ name: 'CreateSubscriptionConstraint', async: false })
export class CreateSubscriptionConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments) {
    const dto = args.object as UpdateSubscriptionDto;

    const fieldsProvided = [
      dto.name,
      dto.price,
      dto.billingPeriod,
      dto.vendorTypeId,
      dto.features,
      dto.discountPrice,
      dto.gradientStart,
      dto.status,
      dto.features,
      dto.gradientEnd,
    ].some((field) => field !== undefined && field !== null);

    const isDiscountValid =
      dto.discountPrice === undefined ||
      (dto.price !== undefined && dto.discountPrice < dto.price);

    return fieldsProvided && isDiscountValid;
  }

  defaultMessage() {
    return `At least one required field must be provided (name, price, billingPeriod, vendorTypeId, features). Also, discountPrice must be less than price.`;
  }
}

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'Name of the subscription plan',
    example: 'Street Food Premium Monthly',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Plan name should not be empty' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Price of the subscription in rupees',
    example: 100,
    required: true,
  })
  @IsOptional()
  @IsInt({ message: 'Price must be an integer' })
  price?: number;

  @ApiProperty({
    description: 'Discounted price (must be less than price)',
    example: 80,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Discount price must be an integer' })
  discountPrice?: number;

  @ApiProperty({
    description: 'Billing period of the subscription plan',
    enum: BillingPeriod,
    example: BillingPeriod.MONTHLY,
    required: true,
  })
  @IsOptional()
  @IsEnum(BillingPeriod, {
    message: `Billing period must be one of: ${Object.values(BillingPeriod).join(', ')}`,
  })
  billingPeriod?: BillingPeriod;

  @ApiProperty({
    description: 'Vendor type this plan belongs to',
    example: '6b1a8c2e-98d5-4fae-947b-06c6c1e9e801',
    required: true,
  })
  @IsOptional()
  @IsUUID()
  vendorTypeId?: string;

  @ApiProperty({
    description: 'Gradient start color (e.g., #FF5733)',
    example: '#FF5733',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'Gradient start color must be a valid hex code',
  })
  gradientStart?: string;

  @ApiProperty({
    description: 'Gradient end color (e.g., #FFC300)',
    example: '#FFC300',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'Gradient end color must be a valid hex code',
  })
  gradientEnd?: string;

  @ApiProperty({
    description: 'JSON object containing all features of the subscription',
    example: {
      openCloseShop: true,
      productEditLimit: 20,
      stockEditLimit: 60,
      paymentModes: ['Cash', 'UPI', 'Coins'],
      locationPingLimit: 5,
      orderMode: ['Takeaway', 'Dinein'],
      coinLimit: 1000,
      profileDeviceLimit: 2,
      offerOnHomepage: false,
      promoteProductSocial: false,
      customerSupport: true,
    },
    required: true,
    type: Object,
  })
  @IsObject({ message: 'Features must be a valid JSON object' })
  @IsOptional()
  features?: Record<string, any>;

  @ApiProperty({
    description: 'Status of the subscription plan',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
    default: Status.INACTIVE,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

  @Validate(CreateSubscriptionConstraint)
  validationTrigger?: string;
}
