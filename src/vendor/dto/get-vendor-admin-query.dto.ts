import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ApprovedOrPendingStatus {
  APPROVED = 'true',
  PENDING = 'false',
}

// This is a constant, not a map syntax
export const ApprovedOrPendingMap = {
  true: true,
  false: false,
};

export class GetVendorQueryForAdminDto {
  @ApiPropertyOptional({
    description: 'Filter by vendor name',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'vendorName must be a string' })
  vendorName?: string;

  @ApiPropertyOptional({
    description: 'mobile',
    type: String,
  })
  @IsString()
  @IsOptional()
  mobile?: string;

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
  @IsEnum(ApprovedOrPendingStatus, {
    message: `licenseStatus must be either '${ApprovedOrPendingStatus.APPROVED}' or '${ApprovedOrPendingStatus.PENDING}'`,
  })
  @IsOptional()
  licenseStatus?: ApprovedOrPendingStatus;

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
