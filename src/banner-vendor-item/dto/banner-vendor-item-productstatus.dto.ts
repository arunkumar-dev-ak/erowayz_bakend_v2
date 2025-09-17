import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class BannerVendorItemProductStatusDto {
  @ApiProperty({
    description: 'Product availability status',
    enum: ProductStatus,
    example: ProductStatus.OUT_OF_STOCK,
  })
  @IsEnum(ProductStatus, {
    message: `Invalid Product Status. Must be one of ${Object.values(ProductStatus).join(', ')} values`,
  })
  productstatus: ProductStatus;
}
