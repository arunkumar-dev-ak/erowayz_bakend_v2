import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SelfDeleteAccountDto {
  @ApiPropertyOptional({
    description: 'Optional reason for requesting account deletion',
    example: 'No longer using this service',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason?: string;
}
