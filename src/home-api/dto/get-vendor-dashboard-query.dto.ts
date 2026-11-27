import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetVendorDashboardQueryDto {
  @ApiPropertyOptional({
    description:
      'Start date and time in ISO UTC format (defaults to 7 days ago if omitted)',
    example: '2026-11-19T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'startDateTime must be a valid ISO 8601 date string' })
  @IsOptional()
  startDateTime?: string;

  @ApiPropertyOptional({
    description:
      'End date and time in ISO UTC format (defaults to current time if omitted)',
    example: '2026-11-26T21:00:00.000Z',
  })
  @IsDateString({}, { message: 'endDateTime must be a valid ISO 8601 date string' })
  @IsOptional()
  endDateTime?: string;
}
