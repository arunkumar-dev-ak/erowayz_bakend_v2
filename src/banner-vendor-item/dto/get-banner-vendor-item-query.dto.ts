import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, Status } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetBannerVendorItemQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by banner vendor item ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  bannerVendorItemId?: string;

  @ApiPropertyOptional({
    description: 'Filter by item name (partial or full match)',
    type: String,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by vendor ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  vendorId?: string;

  @ApiPropertyOptional({
    description: `Filter by product status. Allowed values: ${Object.values(ProductStatus).join(', ')}`,
    enum: ProductStatus,
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `Invalid productStatus. Allowed values: ${Object.values(ProductStatus).join(', ')}`,
  })
  productStatus?: ProductStatus;

  @ApiPropertyOptional({
    description: `Filter by item status. Allowed values: ${Object.values(Status).join(', ')}`,
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Invalid status. Allowed values: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

  @ApiPropertyOptional({
    description: 'Pagination offset (as a string), default is "0"',
    type: Number,
  })
  @IsNumberString({}, { message: 'Offset must be a numeric string' })
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit (as a string), default is "10"',
    type: Number,
  })
  @IsNumberString({}, { message: 'Limit must be a numeric string' })
  @IsOptional()
  limit?: string = '10';
}
