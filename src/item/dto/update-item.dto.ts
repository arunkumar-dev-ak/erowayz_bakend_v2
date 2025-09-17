import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuantityUnit, Status } from '@prisma/client';
import {
  IsArray,
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
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

@ValidatorConstraint({ name: 'ValidatePriceOnUpdate', async: false })
export class ValidatePriceOnUpdateConstraint
  implements ValidatorConstraintInterface
{
  validate(discountPrice: number, args: ValidationArguments) {
    const obj = args.object as UpdateItemDto;
    if (obj.price && obj.price < discountPrice) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return `Price must be greater than the discount price`;
  }
}

export class UpdateItemDto {
  @ApiProperty({
    description: 'Name should not be empty',
    required: false,
    example: 'Mushroom Biryani',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty, if defined' })
  name?: string;

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
    description: 'Description should not be empty, if defined',
    required: false,
    example: 'Your description here',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty, if defined' })
  description?: string;

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
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'Price must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: 'Price must be greater than zero' })
  @IsNotEmpty({ message: 'Price should not be empty, if defined' })
  price?: number;

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
  @ValidateIf((obj: UpdateItemDto) => obj.discountPrice !== undefined)
  @Min(1.0, { message: 'Discount Price must be greater than zero' })
  @Validate(ValidatePriceOnUpdateConstraint)
  discountPrice?: number;

  @ApiProperty({
    description:
      'QuantityUnit should be one of the predefined values, if defined',
    required: true,
    enum: QuantityUnit,
  })
  @IsOptional()
  @IsEnum(QuantityUnit, {
    message:
      'Invalid Quantity Unit. Must be one of: GENERAL, KG, GRAM, BOX, SET, PIECE, LITRE, MILLILITRE, UNIT, SERVE., if defined',
  })
  quantityUnit?: QuantityUnit;

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
    description: 'Daily Total quantity available, if defined',
    required: true,
    example: 1.5,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Daily Total qty must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: 'Daily Total qty must be greater than zero' })
  @IsNotEmpty({ message: 'Daily Total qty should not be empty, if defined' })
  dailyTotalQty?: number;

  @ApiProperty({
    description: 'Minimum selling quantity, if defined',
    required: true,
    example: 1.5,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'MinSellingQty should not be empty, if defined' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'MinSellingQty must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: 'MinSellingQty must be greater than zero' })
  minSellingQty?: number;

  @ApiProperty({
    description: 'Category Id (UUID format)',
    required: false,
    example: 'c5f2559b-6844-405c-ada2-90e077175e5f',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Category Id should not be empty' })
  categoryId?: string;

  @ApiProperty({
    description: 'Sub Category Id (UUID format)',
    required: false,
    example: 'c5f2559b-6844-405c-ada2-90e077175e5f',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Sub Category Id should not be empty' })
  subCategoryId?: string;

  @ApiProperty({
    type: 'array',
    description: 'Deleted Item ImageId',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Deleted Item ImageId must be in an array format' })
  @IsString({
    each: true,
    message: 'Each Deleted Item ImageId must be a string',
  })
  @Validate(IsUniqueArrayConstraint)
  deletedItemImageIds: string[];

  @ApiProperty({
    description: 'Status is either ACTIVE or INACTIVE',
    required: true,
    enum: Status,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    format: 'binary',
    required: true,
    type: 'string',
  })
  files: Express.Multer.File[];
}
