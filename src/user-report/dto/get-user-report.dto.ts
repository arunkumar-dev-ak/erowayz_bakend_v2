import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetUserReportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter License Category by name',
    type: String,
  })
  @IsString()
  @IsOptional()
  shopName?: string;

  @ApiPropertyOptional({
    description: 'Filter License Category by name',
    type: String,
  })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({
    description: 'Filter License Category by name',
    type: String,
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Filter License Category by name',
    type: String,
  })
  @IsString()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({
    description: 'Start date and time of the banner',
    example: '2024-09-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({
    description: 'Number of records to skip (for pagination), default is 0',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Number of records to return (for pagination), default is 10',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  limit?: string = '10';
}
