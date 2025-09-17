import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ServiceOptionPricingDto {
  @ApiProperty({ description: 'Price is required', required: true })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber()
  price: number;
}
