import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class CustomerTrustStatsDto {
  @ApiProperty({ description: 'Whether customer has earned the trust badge', example: true })
  @IsBoolean()
  isTrustedCustomer: boolean;

  @ApiProperty({ description: 'Total cumulative completed orders and bookings across all categories', example: 18 })
  @IsInt()
  @Min(0)
  totalCompletedOrders: number;

  @ApiProperty({ description: 'Total completed Street Food & Common Shop orders', example: 14 })
  @IsInt()
  @Min(0)
  ordersCount: number;

  @ApiProperty({ description: 'Total completed Vehicle Service bookings', example: 4 })
  @IsInt()
  @Min(0)
  bookingsCount: number;

  @ApiProperty({ description: 'Current Admin-configured order threshold', example: 15 })
  @IsInt()
  @Min(1)
  threshold: number;

  @ApiProperty({ description: 'Whether trust badge system is active', example: true })
  @IsBoolean()
  isActive: boolean;
}

export class TrustSettingResponseDto {
  @ApiProperty({ description: 'Unique ID of the trust setting' })
  id: string;

  @ApiProperty({ description: 'Number of completed orders required for trusted customer badge', example: 15 })
  @IsInt()
  @Min(1)
  orderThreshold: number;

  @ApiProperty({ description: 'Whether the customer trust badge system is active', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Description of the trust setting', example: 'Platform-wide trust threshold' })
  description?: string;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;
}
