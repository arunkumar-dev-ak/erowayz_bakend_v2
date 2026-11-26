import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBusinessLoadTierDto {
  @ApiProperty({
    description: 'Name of the business load tier (e.g. Normal, Light, Busy, MAX BUSY)',
    example: 'Busy',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Minimum active in-progress orders threshold for this tier',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  minOrders: number;

  @ApiPropertyOptional({
    description:
      'Maximum active in-progress orders for this tier. Leave null/empty for unbounded upper limit (e.g. 5+).',
    example: 3,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxOrders?: number | null;

  @ApiProperty({
    description: 'Hex color code for this load tier badge',
    example: '#F97316',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiPropertyOptional({
    description: 'Estimated customer wait-time display text',
    example: '25-35 mins',
  })
  @IsOptional()
  @IsString()
  estimatedWaitTimeText?: string;

  @ApiPropertyOptional({
    description: 'Order index for sorting tiers (e.g. 0, 1, 2, ...)',
    example: 3,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({
    description: 'Whether this load tier is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
