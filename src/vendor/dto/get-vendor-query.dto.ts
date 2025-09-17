import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VendorCategoryType } from '@prisma/client';

export enum ShopStatus {
  OPEN = 'Open',
  CLOSE = 'Close',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export const UserStatusBooleanMap = {
  Active: true,
  Inactive: false,
};

export const ShopStatusBooleanMap = {
  Open: true,
  Close: false,
};

export class GetVendorQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by shop status (Open or Close)',
    type: String,
  })
  @IsOptional()
  @IsEnum(ShopStatus, {
    message: `shopStatus must be one of: ${Object.values(ShopStatus).join(', ')}`,
  })
  shopStatus?: ShopStatus;

  @ApiPropertyOptional({
    description: 'Filter by vendor status (Active or Inactive)',
    type: String,
  })
  @IsOptional()
  @IsEnum(UserStatus, {
    message: `vendorStatus must be one of: ${Object.values(UserStatus).join(', ')}`,
  })
  vendorStatus?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filter by vendor name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'vendorName must be a string' })
  vendorName?: string;

  @ApiPropertyOptional({
    description: 'Filter by vendor Id',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'vendorName Id be a string' })
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by vendor type ID',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'vendorTypeId must be a string' })
  vendorTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by keyword IDs',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'keywordId must be a string' })
  @IsNotEmpty({ message: 'keywordIds must not be empty' })
  keywordId?: string;

  @ApiPropertyOptional({
    description: 'Filter by serviceOptionId',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'serviceOptionId must be a string' })
  @IsNotEmpty({ message: 'serviceOptionIds must not be empty' })
  serviceOptionId?: string;

  @ApiPropertyOptional({
    description: `vendorCategoryType must be one of: ${Object.values(VendorCategoryType).join(', ')}`,
    type: String,
  })
  @IsOptional()
  @IsEnum(VendorCategoryType, {
    message: `vendorCategoryType must be one of: ${Object.values(VendorCategoryType).join(', ')}`,
  })
  vendorCategoryType?: VendorCategoryType;

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
    description: 'Pagination offset (defaults to 0)',
    type: Number,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'offset must be a numeric string' })
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit (defaults to 10)',
    type: Number,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'limit must be a numeric string' })
  limit?: string = '10';
}
