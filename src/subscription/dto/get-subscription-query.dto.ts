import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillingPeriod, Status, VendorCategoryType } from '@prisma/client';

export class GetSubscriptionPlanQueryDto {
  @ApiPropertyOptional({
    description: 'Filter subscription plans by vendor type ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  vendorTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter subscription plans by subscription name',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Subscription name must not be empty' })
  subscriptionName?: string;

  @ApiPropertyOptional({
    description: 'Filter subscription plans by subscription plan ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Subscription plan ID must not be empty' })
  subscriptionPlanId?: string;

  @ApiPropertyOptional({
    description: `Filter subscription plans by billing period. Allowed values: ${Object.values(
      BillingPeriod,
    ).join(', ')}`,
    type: String,
  })
  @IsOptional()
  @IsEnum(BillingPeriod, {
    message: `Billing period must be one of: ${Object.values(BillingPeriod).join(', ')}`,
  })
  billingPeriod?: BillingPeriod;

  @ApiPropertyOptional({
    description: `Vendor Category type. Allowed values: ${Object.values(
      VendorCategoryType,
    ).join(', ')}`,
    type: String,
  })
  @IsOptional()
  @IsEnum(VendorCategoryType, {
    message: `Vendor Category type must be one of: ${Object.values(VendorCategoryType).join(', ')}`,
  })
  vendorCategoryType: VendorCategoryType;

  @ApiPropertyOptional({
    description: `Filter subscription plans by status. Allowed values: ${Object.values(
      Status,
    ).join(', ')}`,
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  status?: Status;

  @ApiPropertyOptional({
    description: 'Pagination offset (number of records to skip), default is 0',
    type: Number,
  })
  @IsNumberString({}, { message: 'Offset must be a number in string format' })
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional({
    description:
      'Pagination limit (number of records to return), default is 10',
    type: Number,
  })
  @IsNumberString({}, { message: 'Limit must be a number in string format' })
  @IsOptional()
  limit?: string = '10';
}
