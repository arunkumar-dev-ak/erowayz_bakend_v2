import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class VendorTransferToCustomerDto {
  @ApiProperty({
    description: 'Number of coins to transfer',
    example: 1000,
  })
  @IsNumber({}, { message: 'Coins count must be a number' })
  @IsPositive({ message: 'Coins count must be greater than 0' })
  @IsNotEmpty({ message: 'Coins count is required' })
  coinsCount: number;

  @ApiProperty({
    description: 'User ID of the customer who will receive the coins',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  customerUserId: string;
}
