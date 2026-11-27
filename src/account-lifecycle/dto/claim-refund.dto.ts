import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ClaimRefundDto {
  @ApiPropertyOptional({
    description: 'Admin notes on payout / transaction reference for refunding coins',
    example: 'Transferred Rs. 500 to customer UPI: user@okhdfcbank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
