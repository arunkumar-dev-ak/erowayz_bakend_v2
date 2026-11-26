import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBusinessLoadTierDto } from './create-business-load-tier.dto';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBusinessLoadTierDto extends PartialType(
  CreateBusinessLoadTierDto,
) {
  @ApiPropertyOptional({
    description: 'Name of the business load tier',
    example: 'Rush Hour',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Minimum active orders threshold',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minOrders?: number;

  @ApiPropertyOptional({
    description: 'Maximum active orders threshold (null for unbounded)',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxOrders?: number | null;

  @ApiPropertyOptional({
    description: 'Hex color code',
    example: '#EA580C',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Estimated wait-time display text',
    example: '30-40 mins',
  })
  @IsOptional()
  @IsString()
  estimatedWaitTimeText?: string;

  @ApiPropertyOptional({
    description: 'Order index for sorting',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({
    description: 'Whether tier is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
