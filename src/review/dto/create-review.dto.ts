import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'OrderConstraint', async: false })
export class ReviewConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const dto = args.object as CreateReviewDto;

    const hasTarget = !!dto.orderItemId || !!dto.vendorId;
    const hasContent = dto.rating !== undefined || !!dto.review;

    return hasTarget && hasContent;
  }

  defaultMessage() {
    return 'Review must have either orderItemId or vendorId AND at least one of rating or review.';
  }
}

export class CreateReviewDto {
  @ApiPropertyOptional({
    description: 'Order Item ID (if reviewing an order item)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'orderItemId should not be empty if defined' })
  orderItemId?: string;

  @ApiPropertyOptional({ description: 'Vendor ID (if reviewing a vendor)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'vendorId should not be empty if defined' })
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Rating (optional, from 1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty({ message: 'rating should not be empty if defined' })
  rating?: number;

  @ApiPropertyOptional({ description: 'Review text (optional)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'review should not be empty if defined' })
  review?: string;

  @Validate(ReviewConstraint)
  validationTrigger?: string;
}
