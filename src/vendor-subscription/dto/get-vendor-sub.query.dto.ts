import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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
    description: 'Filter by subscription name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'subscription Name must be a string' })
  subscriptionName?: string; // This can refer to a plan name or ID
}
