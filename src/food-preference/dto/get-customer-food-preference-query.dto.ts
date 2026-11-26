import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetCustomerFoodPreferenceQueryDto {
  @ApiPropertyOptional({
    description:
      'Cart ID belonging to the authenticated customer. If omitted, resolves the customer active cart.',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'cartId cannot be empty if provided' })
  cartId?: string;

  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
    example: 0,
  })
  @IsOptional()
  @IsNumberString()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
