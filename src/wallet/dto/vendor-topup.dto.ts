import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class VendorTopUpDto {
  @ApiProperty({ description: 'Number of coins to top up', example: 1000 })
  @IsNumber({}, { message: 'Coins count must be a number' })
  @IsPositive({ message: 'Coins count must be greater than 0' })
  @IsNotEmpty({ message: 'Coins count is required' })
  coinsCount: number;
}
