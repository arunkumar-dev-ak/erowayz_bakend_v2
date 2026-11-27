import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class GetUnifiedStorefrontQueryDto {
  @ApiPropertyOptional({
    default: 0,
    description: 'Pagination offset for storefront items, services, or banners',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    default: 10,
    description: 'Pagination limit for storefront items, services, or banners',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    required: false,
    description:
      'Optional category filter: categoryId (for PRODUCT vendors) or serviceOptionId (for SERVICE vendors)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'filterId must be a valid UUID' })
  filterId?: string;
}
