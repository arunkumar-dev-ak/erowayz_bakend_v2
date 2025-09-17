import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OrderPaymentDto {
  @ApiProperty({
    description: 'orderId',
    required: false,
    example: 'ghfjfkjf547484bnnfmmfgf799',
  })
  @IsString()
  orderId: string;
}
