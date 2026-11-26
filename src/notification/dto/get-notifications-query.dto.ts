import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({ default: 0, description: 'Pagination offset' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ default: 10, description: 'Pagination limit' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by read status (true or false)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by common screen navigation identifier (e.g. NEW_ORDER, ORDER_STATUS_UPDATE, etc.)',
    example: 'NEW_ORDER',
  })
  @IsOptional()
  @IsString()
  identifier?: string;
}
