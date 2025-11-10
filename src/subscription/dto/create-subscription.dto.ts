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
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BillingPeriod, Status } from '@prisma/client';

@ValidatorConstraint({ name: 'IsDiscountValid', async: false })
class IsDiscountValidConstraint implements ValidatorConstraintInterface {
  validate(discountPrice: number, args: ValidationArguments) {
    const dto = args.object as CreateSubscriptionDto;
    if (discountPrice === undefined) return true;

    if (dto.price === 0) return discountPrice === 0;
    return discountPrice < dto.price;
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as CreateSubscriptionDto;
    if (dto.price === 0) {
      return 'Discount price must be 0 if actual price is 0';
    }
    return 'Discount price must be less than the actual price';
  }
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Name of the subscription plan',
    example: 'Street Food Premium Monthly',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Plan name should not be empty' })
  name: string;

  @ApiProperty({
    description: 'Price of the subscription in rupees',
    example: 100,
    required: true,
  })
  @IsInt({ message: 'Price must be an integer' })
  price: number;

  @ApiProperty({
    description: 'Discounted price (must be less than price)',
    example: 80,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Discount price must be an integer' })
  @Validate(IsDiscountValidConstraint)
  discountPrice?: number;

  @ApiProperty({
    description: 'Billing period of the subscription plan',
    enum: BillingPeriod,
    example: BillingPeriod.MONTHLY,
    required: true,
  })
  @IsEnum(BillingPeriod, {
    message: `Billing period must be one of: ${Object.values(BillingPeriod).join(', ')}`,
  })
  billingPeriod: BillingPeriod;

  @ApiProperty({
    description: 'Vendor type this plan belongs to',
    example: '6b1a8c2e-98d5-4fae-947b-06c6c1e9e801',
    required: true,
  })
  @IsUUID()
  vendorTypeId: string;

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
      serviceOptions: ['Takeaway-uuid', 'Dinein-uuid'],
      coinLimit: 1000,
      profileDeviceLimit: 2,
      offerOnHomepage: false,
      promoteProductSocial: false,
      customerSupport: true,
      featuredProductAddition: true,
    },
    required: true,
    type: Object,
  })
  @IsObject({ message: 'Features must be a valid JSON object' })
  features: Record<string, any>;

  @ApiProperty({
    description: 'Status of the subscription plan',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
    default: Status.INACTIVE,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  status?: Status;
}
