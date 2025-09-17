import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuantityUnit } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidatePriceOnCreate', async: false })
export class ValidatePriceOnCreateConstraint
  implements ValidatorConstraintInterface
{
  validate(discountPrice: number, args: ValidationArguments) {
    const obj = args.object as CreateItemDto;
    if (obj.price < discountPrice) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return `Price must be greater than the discount price`;
  }
}

export class CreateItemDto {
  @ApiProperty({
    description: 'Name should not be empty',
    required: true,
    example: 'Mushroom Biryani',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @ApiProperty({
    description: 'Name Tamil should not be empty',
    required: true,
    example: 'Mushroom Biryani',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name should not be empty' })
  nameTamil?: string;

  @ApiProperty({
    description: 'Description should not be empty',
    required: true,
    example: 'Your description here',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: string;

  @ApiProperty({
    description: 'Description Tamil should not be empty',
    required: true,
    example: 'Your description here',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Description Tamil should not be empty' })
  descriptionTamil?: string;

  @ApiProperty({
    description:
      'Price should be greater than zero and have exactly 2 decimal places',
    required: true,
    example: 25.22,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @Min(1.0, { message: 'Price must be greater than zero' })
  @IsNotEmpty({ message: 'Price should not be empty' })
  price: number;

  @ApiProperty({
    description: 'Discount Price (optional)',
    required: false,
    example: 20.99,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Discount Price must be a valid number with up to 2 decimal places',
    },
  )
  @ValidateIf((obj: CreateItemDto) => obj.discountPrice !== undefined)
  @Min(1.0, { message: 'Discount Price must be greater than zero' })
  @Validate(ValidatePriceOnCreateConstraint)
  discountPrice?: number;

  @ApiProperty({
    description: 'QuantityUnit should be one of the predefined values',
    required: true,
    enum: QuantityUnit,
  })
  @IsEnum(QuantityUnit, {
    message:
      'Invalid Quantity Unit. Must be one of: GENERAL, KG, GRAM, BOX, SET, PIECE, LITRE, MILLILITRE, UNIT, SERVE.',
  })
  quantityUnit: QuantityUnit;

  @ApiProperty({
    description: 'Daily Total quantity available',
    required: true,
    example: 1.5,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Daily Total qty must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: 'Daily Total qty must be greater than zero' })
  @IsNotEmpty({ message: 'Daily Total qty should not be empty' })
  dailyTotalQty: number;

  @ApiProperty({
    description: 'Minimum selling quantity',
    required: true,
    example: 1.5,
  })
  @IsNotEmpty({ message: 'MinSellingQty should not be empty' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'MinSellingQty must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: 'MinSellingQty must be greater than zero' })
  @ValidateIf(
    (obj: CreateItemDto) =>
      obj.minSellingQty !== undefined && obj.minSellingQty > obj.dailyTotalQty,
    {
      message: 'MinSellingQty must be less than or equal to totalQty',
    },
  )
  minSellingQty: number;

  @ApiProperty({
    description: 'Category Id (UUID format)',
    required: true,
    example: 'c5f2559b-6844-405c-ada2-90e077175e5f',
  })
  @IsString()
  @IsNotEmpty({ message: 'Category Id should not be empty' })
  categoryId: string;

  @ApiProperty({
    description: 'Sub Category Id (UUID format)',
    required: true,
    example: 'c5f2559b-6844-405c-ada2-90e077175e5f',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sub Category Id should not be empty' })
  subCategoryId: string;

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
    format: 'binary',
    required: true,
    type: 'string',
  })
  files: Express.Multer.File[];
}
