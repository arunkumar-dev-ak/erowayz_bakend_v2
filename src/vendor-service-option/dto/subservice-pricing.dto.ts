import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSubServicePricingDto {
  @ApiProperty({
    description: 'The ID of the Vendor Service Option',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Vendor Service Option Id is required' })
  vendorServiceOptId: string;

  @ApiProperty({
    description: 'The ID of the Sub-Service',
    example: '789e1234-e89b-12d3-a456-426614174999',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sub Service Id is required' })
  subServiceId: string;

  @ApiProperty({
    description: 'The price of the sub-service',
    example: 99.99,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number;
}
