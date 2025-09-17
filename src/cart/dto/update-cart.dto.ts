import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({
    description: 'Total quantity',
    required: true,
    example: 1.5,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: ' Total qty must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1, { message: 'TotalQty must be greater than 0' })
  @IsNotEmpty({ message: 'Daily Total qty should not be empty' })
  totalQty: number;
}
