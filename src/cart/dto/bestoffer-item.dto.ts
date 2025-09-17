import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BestOfferItemDto {
  @ApiProperty({
    description: 'itemId',
    required: true,
    example: 'gfhfkksnsd46378338',
  })
  @IsString()
  @IsNotEmpty({ message: 'itemId is required' })
  itemId: string;

  @ApiProperty({
    description: 'quantity',
    required: true,
    example: '10',
  })
  @IsNumber()
  @IsNotEmpty({ message: 'quantity is required' })
  quantity: number;
}
