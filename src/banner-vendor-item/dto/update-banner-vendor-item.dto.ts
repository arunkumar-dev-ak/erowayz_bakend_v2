import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, Status } from '@prisma/client';
import {
  IsArray,
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
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

@ValidatorConstraint({ name: 'ValidateDiscountPriceOnUpdate', async: false })
export class ValidateDiscountPriceOnUpdateConstraint
  implements ValidatorConstraintInterface
{
  validate(discountPrice: number, args: ValidationArguments) {
    const obj = args.object as UpdateBannerVendorItemDto;
    if (
      discountPrice !== undefined &&
      obj.price !== undefined &&
      obj.price < discountPrice
    ) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return 'Price must be greater than or equal to the discount price';
  }
}

export class UpdateBannerVendorItemDto {
  @ApiPropertyOptional({
    description: 'Name of the item',
    example: 'Updated Veg Combo',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the item',
    example: 'Updated description of the item.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Actual price of the item',
    example: 199.99,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @Min(1.0, { message: 'Price must be greater than zero' })
  price?: number;

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

  @ApiPropertyOptional({
    description: 'Discounted price of the item',
    example: 149.99,
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
  @Validate(ValidateDiscountPriceOnUpdateConstraint)
  discountPrice?: number;

  @ApiProperty({
    description: 'ProductUnitId should not be empty',
    required: true,
    example: 'Your ProductUnitId here',
  })
  @IsString()
  @IsNotEmpty({ message: 'ProductUnitId should not be empty' })
  @IsOptional()
  productUnitId?: string;

  @ApiPropertyOptional({
    description: 'Quantity of the item',
    example: 10,
  })
  @IsInt({ message: 'Quantity must be an integer number' })
  @Min(0, { message: 'Quantity must be at least 0' })
  @IsNotEmpty({ message: 'Quantity should not be empty' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
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
    description: 'Record status',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Invalid Status. Must be one of ${Object.values(ProductStatus).join(', ')} values`,
  })
  status?: Status;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Deleted Foreground Image ImageId',
    required: false,
  })
  @IsOptional()
  @IsArray({
    message: 'Deleted Foreground Image ImageId must be in an array format',
  })
  @IsString({
    each: true,
    message: 'Each Deleted Foreground Image ImageId must be a string',
  })
  @Validate(IsUniqueArrayConstraint)
  deletedItemImageIds?: string[];

  @ApiPropertyOptional({
    format: 'binary',
    required: false,
    type: 'string',
    description: 'Images to be uploaded for the banner vendor item',
  })
  @IsOptional()
  files?: Express.Multer.File[];
}
