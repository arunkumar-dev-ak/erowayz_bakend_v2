import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum GetBannerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

export class GetBannerQuery {
  @ApiPropertyOptional({ type: String, description: 'Filter by Banner name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name is not be empty' })
  name?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by vendor ID' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'VendorId is not be empty' })
  vendorId?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by shop name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Shopname is not be empty' })
  shopName?: string;

  @ApiPropertyOptional({
    description: 'Filter by keyword IDs',
    type: [String],
  })
  @IsOptional()
  @IsString({ message: 'keywordId must be a string' })
  @IsNotEmpty({ message: 'keywordIds must not be empty' })
  keywordId?: string;

  @ApiPropertyOptional({
    enum: GetBannerStatus,
    description:
      'Filter by status (ACTIVE, INACTIVE, or ALL) default is ACTIVE',
  })
  @IsOptional()
  @IsEnum(GetBannerStatus, {
    message: 'status must be one of: ACTIVE, INACTIVE, or ALL',
  })
  status?: GetBannerStatus = GetBannerStatus.ACTIVE;

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
    description: 'Latitude must be between -90 and 90',
    required: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsLatitude({ message: 'Latitude must be between -90 and 90' })
  @IsNotEmpty({ message: 'Latitude is required' })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude must be between -180 and 180',
    required: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsLongitude({ message: 'Longitude must be between -180 and 180' })
  @IsNotEmpty({ message: 'Longitude is required' })
  longitude?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Pagination limit, defaults to 10',
    example: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Offset must not be empty' })
  limit?: string = '10';

  @ApiPropertyOptional({
    description: 'In Date range is either true or false',
    type: String,
    example: 'true',
  })
  @IsOptional()
  @IsIn(['true', 'false'], {
    message: 'someData must be either true or false',
  })
  inDateRange?: string = 'true';
}
