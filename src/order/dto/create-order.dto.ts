import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

@ValidatorConstraint({ name: 'OrderConstraint', async: false })
export class OrderConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const dto = args.object as CreateOrderDto;

    const hasCart = !!dto.cartId;
    const hasItem = !!dto.itemId;
    const hasQty = dto.totalQty !== undefined && dto.totalQty !== null;
    const hasVendorServiceOpt =
      dto.vendorServiceOptionIds !== undefined &&
      dto.vendorServiceOptionIds.length > 0;

    // Valid if only cartId is present OR both itemId and totalQty are present
    if (
      (hasCart && !hasItem && !hasQty && !hasVendorServiceOpt) ||
      (!hasCart && hasItem && hasQty && hasVendorServiceOpt)
    ) {
      return true;
    }

    return false;
  }

  defaultMessage(): string {
    return 'Provide either [itemId and totalQty, vendorServiceOptionIds] or [cartId], not both or partial.';
  }
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'cartId',
    required: false,
    example: 'ghfjfkjf547484bnnfmmfgf799',
  })
  @IsOptional()
  @IsString()
  cartId?: string;

  @ApiProperty({
    description: 'itemId',
    required: false,
    example: 'ghfjfkjf547484bnnfmmfgf799',
  })
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiProperty({
    description: 'bannerId',
    required: false,
    example: 'rehijhnfdjf657585hfhfh',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Banner Id should not be empty if defined' })
  bannerId?: string;

  @ApiProperty({
    description: 'paymentStatus',
    required: true,
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod, {
    message: `Payment status must be one of ${Object.values(PaymentMethod).join(', ')}`,
  })
  preferredPaymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'totalQty',
    required: false,
    example: 1.5,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'Total qty must be a number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: 'Total qty must be greater than zero' })
  totalQty?: number;

  @ApiProperty({
    description: 'Array of vendorServiceOptionIds',
    required: true,
    example: ['gfhfkksnsd46378338', 'abchsj772hjsd828'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'vendorServiceOptionIds cannot be empty' })
  @Validate(IsUniqueArrayConstraint)
  @IsOptional()
  @IsString({
    each: true,
    message: 'Each vendorServiceOptionId must be a string',
  })
  vendorServiceOptionIds?: string[];

  // Dummy property to hook in class-level validation
  @Validate(OrderConstraint)
  validationTrigger?: string;
}
