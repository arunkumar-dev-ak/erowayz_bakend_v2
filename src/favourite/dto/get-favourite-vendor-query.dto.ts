import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetFavouriteVendorQueryDto {
  @ApiPropertyOptional({
    description: 'ShopName of the customer who is marking favorite',
    example: 'customer_name',
  })
  @IsOptional()
  @IsString({ message: 'ShopName must be a string' })
  @IsNotEmpty({ message: 'ShopName must not be empty' })
  shopName?: string;

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
