import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAdminOrderQueryDto {
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
    description: 'UserName',
    type: String,
  })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({
    description: 'vendorName',
    type: String,
  })
  @IsString()
  @IsOptional()
  vendorName?: string;

  @ApiPropertyOptional({
    description: 'orderId',
    type: String,
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'shopName',
    type: String,
  })
  @IsString()
  @IsOptional()
  shopName?: string;

  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  limit?: string = '10';
}
