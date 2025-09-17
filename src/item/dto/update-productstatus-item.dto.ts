import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateProductStatusDto {
  @ApiProperty({
    description: 'Status is either AVAILABLE or OUT_OF_STOCK',
    required: true,
    enum: ProductStatus,
  })
  @IsNotEmpty({ message: 'Product status should not be empty' })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
