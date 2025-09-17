import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPaymentDto {
  @ApiProperty({
    description: 'OrderId of the payment',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'OrderId is required' })
  orderId: string;
}
