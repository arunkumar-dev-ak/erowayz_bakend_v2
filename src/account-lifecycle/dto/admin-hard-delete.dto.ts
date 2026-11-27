import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminHardDeleteDto {
  @ApiPropertyOptional({
    description: 'Admin audit reason for permanently deleting this user account',
    example: 'Account fraud / user requested complete data wipe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason?: string;
}
