import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

export class GetVendorSubscriptionQueryForAdmin {
  @ApiPropertyOptional({
    description: 'Filter by active subscription status (true or false)',
    enum: TrueOrFalseStatus,
  })
  @IsOptional()
  @IsEnum(TrueOrFalseStatus, {
    message: `isActive must be one of: ${Object.values(TrueOrFalseStatus).join(', ')}`,
  })
  isActive?: TrueOrFalseStatus;

  @ApiPropertyOptional({
    description: 'Filter by Vendor ID',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'vendorId must be a string' })
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by Name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'type must be a string' })
  type?: string;

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
    description: 'Filter by subscription name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'subscription Name must be a string' })
  subscriptionName?: string; // This can refer to a plan name or ID

  @ApiPropertyOptional({
    description: 'Filter by shopName',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'shopName must be a string' })
  shopName?: string;

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
