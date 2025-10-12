import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetSubTransactionQueryForAdminDto {
  @ApiPropertyOptional({
    description: 'Filter by vendor name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'userName must be a string' })
  userName?: string;

  @ApiPropertyOptional({
    description: 'Filter by Shop name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'shopName must be a string' })
  shopName?: string;

  @ApiPropertyOptional({
    description: 'Filter by Shop name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'vendorId must be a string' })
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Shop name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'userId must be a string' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Start date in ISO string format (YYYY-MM-DD)',
    type: String,
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date in ISO string format (YYYY-MM-DD)',
    type: String,
  })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Pagination offset, defaults to 0',
    example: 0,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Offset must not be empty' })
  offset?: string = '0';

  @ApiPropertyOptional({
    type: Number,
    description: 'Pagination limit, defaults to 10',
    example: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Offset must not be empty' })
  limit?: string = '10';
}
