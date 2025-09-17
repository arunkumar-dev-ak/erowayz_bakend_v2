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

// Custom class-level validator
@ValidatorConstraint({ name: 'OrderConstraint', async: false })
export class UpdateReviewConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const dto = args.object as UpdateReviewDto;

    const hasAnyField = dto.rating !== undefined || dto.review !== undefined;

    return hasAnyField;
  }

  defaultMessage() {
    return 'At least one field ( rating, or review) must be provided to update the review.';
  }
}

// DTO with all optional fields + class-level validation
export class UpdateReviewDto {
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

  // Class-level validation trigger
  @Validate(UpdateReviewConstraint)
  validationTrigger?: string;
}
