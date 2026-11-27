import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartBannerQtyDto {
  @ApiProperty({
    description: 'Quantity of combo banner (0 to remove)',
    example: 2,
  })
  @IsNumber()
  @Min(0)
  quantity: number;
}
