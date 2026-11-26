import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFoodPreferenceDto {
  @ApiProperty({
    description: 'Preference name in English',
    example: 'Less Spicy',
  })
  @IsString()
  @IsNotEmpty({ message: 'Preference name in English is required' })
  name: string;

  @ApiProperty({
    description: 'Preference name in Tamil',
    example: 'காரம் குறைவாக',
  })
  @IsString()
  @IsNotEmpty({ message: 'Preference name in Tamil is required' })
  nameTamil: string;

  @ApiProperty({
    description:
      'Array of SubCategory IDs that this food preference belongs to',
    example: ['b3b2c1d0-1234-5678-90ab-cdef12345678'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one subCategoryId is required' })
  @IsString({ each: true })
  subCategoryIds: string[];

  @ApiPropertyOptional({
    description: 'Whether this food preference is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
