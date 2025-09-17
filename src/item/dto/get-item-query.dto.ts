import { IsEnum, IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShopStatus, UserStatus } from 'src/vendor/dto/get-vendor-query.dto';
import { ProductStatus, Status } from '@prisma/client';

export class GetItemQueryDto {
  @ApiPropertyOptional({
    description: 'Filter items by vendor ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Filter items by item ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  itemId?: string;

  @ApiPropertyOptional({
    description: 'Filter items by category name',
    type: String,
  })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional({
    description: 'Filter items by subcategory name',
    type: String,
  })
  @IsString()
  @IsOptional()
  subCategoryName?: string;

  @ApiPropertyOptional({
    description: 'Filter items by category ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter items by subcategory ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  subCategoryId?: string;

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
    description: `vendorStatus must be one of: ${Object.values(UserStatus).join(', ')}`,
    type: String,
  })
  @IsOptional()
  @IsEnum(UserStatus, {
    message: `vendorStatus must be one of: ${Object.values(UserStatus).join(', ')}`,
  })
  vendorStatus?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filter items by item name',
    type: String,
  })
  @IsString()
  @IsOptional()
  itemName?: string;

  @ApiPropertyOptional({
    description: `itemStatus must be one of: ${Object.values(Status).join(', ')}`,
    enum: Status,
  })
  @IsEnum(Status, {
    message: `itemStatus must be one of: ${Object.values(Status).join(', ')}`,
  })
  @IsOptional()
  itemStatus?: Status;

  @ApiPropertyOptional({
    description: `ProductStatus must be one of: ${Object.values(ProductStatus).join(', ')}`,
    enum: ProductStatus,
  })
  @IsEnum(ProductStatus, {
    message: `ProductStatus must be one of: ${Object.values(ProductStatus).join(', ')}`,
  })
  @IsOptional()
  productStatus?: ProductStatus;

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
