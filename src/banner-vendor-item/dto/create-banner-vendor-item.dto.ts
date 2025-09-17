import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuantityUnit, ProductStatus, Status } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidateDiscountPrice', async: false })
export class ValidateDiscountPriceConstraint
  implements ValidatorConstraintInterface
{
  validate(discountPrice: number, args: ValidationArguments) {
    const obj = args.object as CreateBannerVendorItemDto;
    if (discountPrice && obj.price < discountPrice) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return 'Price must be greater than or equal to the discount price';
  }
}

export class CreateBannerVendorItemDto {
  @ApiProperty({
    description: 'Name of the item',
    example: 'Special Veg Combo',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @ApiProperty({
    description: 'Detailed description of the item',
    example: 'A delicious veg combo with rice, dal, and curry.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: string;

  @ApiProperty({
    description: 'Actual price of the item',
    example: 299.99,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @Min(1.0, { message: 'Price must be greater than zero' })
  @IsNotEmpty({ message: 'Price should not be empty' })
  price: number;

  @ApiProperty({
    description: 'Discounted price of the item (optional)',
    required: false,
    example: 249.99,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Discount Price must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: 'Discount Price must be greater than zero' })
  @Validate(ValidateDiscountPriceConstraint)
  discountPrice?: number;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 10,
  })
  @IsInt({ message: 'Quantity must be an integer number' })
  @Min(0, { message: 'Quantity must be at least 0' })
  @IsNotEmpty({ message: 'Quantity should not be empty' })
  quantity: number;

  @ApiProperty({
    description: 'Unit of quantity for the item',
    enum: QuantityUnit,
    example: QuantityUnit.GENERAL,
  })
  @IsEnum(QuantityUnit, {
    message: `Invalid Quantity Unit. Must be one of the ${Object.values(QuantityUnit).join(', ')} values`,
  })
  quantityUnit: QuantityUnit;

  @ApiProperty({
    description: 'Product availability status',
    enum: ProductStatus,
    example: ProductStatus.OUT_OF_STOCK,
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `Invalid Product Status. Must be one of ${Object.values(ProductStatus).join(', ')} values`,
  })
  productstatus?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Expiry Date of the product',
    example: '2024-09-01T00:00:00.000Z',
    required: true,
  })
  @IsOptional()
  @IsDate({
    message: 'expiryDate must be in the format of 2024-09-01T00:00:00.000Z',
  })
  expiryDate?: Date;

  @ApiProperty({
    description: 'Record status',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Invalid  Status. Must be one of ${Object.values(Status).join(', ')} values`,
  })
  status?: Status;

  @ApiProperty({
    format: 'binary',
    required: true,
    type: 'string',
    description: 'Images to be uploaded for the banner vendor item',
  })
  images: Express.Multer.File[];
}
