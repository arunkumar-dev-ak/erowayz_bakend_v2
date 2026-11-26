import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateFoodPreferenceDto } from './create-food-preference.dto';

export class UpdateFoodPreferenceDto extends PartialType(
  CreateFoodPreferenceDto,
) {
  @ApiPropertyOptional({
    description: 'Preference name in English',
    example: 'Extra Spicy',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Preference name in Tamil',
    example: 'அதிக காரம்',
  })
  @IsOptional()
  @IsString()
  nameTamil?: string;

  @ApiPropertyOptional({
    description:
      'Array of SubCategory IDs that this food preference belongs to',
    example: ['b3b2c1d0-1234-5678-90ab-cdef12345678'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({
    message: 'subCategoryIds array cannot be empty if provided',
  })
  @IsString({ each: true })
  subCategoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Whether this food preference is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
