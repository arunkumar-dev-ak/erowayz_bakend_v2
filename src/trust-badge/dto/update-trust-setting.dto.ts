import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTrustSettingDto {
  @ApiProperty({
    description: 'Number of completed orders required for trusted customer badge',
    example: 15,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  orderThreshold: number;

  @ApiPropertyOptional({
    description: 'Whether the customer trust badge system is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Optional description of the trust setting',
    example: 'Platform-wide trust threshold',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
