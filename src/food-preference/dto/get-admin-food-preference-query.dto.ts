import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAdminFoodPreferenceQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by SubCategory ID',
    type: String,
  })
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status (true or false)',
    type: String,
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional({
    description: 'Search by English or Tamil name',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
    example: 0,
  })
  @IsOptional()
  @IsNumberString()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
