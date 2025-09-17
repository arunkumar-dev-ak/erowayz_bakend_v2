import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export enum GetBannerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

export class PredefinedBannerQuery {
  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  offset?: string;

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Filter items by item name',
    type: String,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Item status: ACTIVE, INACTIVE, or ALL (default: ACTIVE)',
    enum: GetBannerStatus,
  })
  @IsEnum(GetBannerStatus, {
    message: 'itemStatus must be one of: ACTIVE, INACTIVE, or ALL',
  })
  status?: GetBannerStatus | 'ALL';
}
