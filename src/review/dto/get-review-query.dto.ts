import {
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetReviewQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by vendor ID',
    type: String,
  })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by review ID',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'reviewId must not be empty' })
  reviewId?: string;

  @ApiPropertyOptional({
    description: 'Filter by item ID (orderItemId)',
    type: String,
  })
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    type: String,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
  })
  @IsOptional()
  @IsNumberString()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
