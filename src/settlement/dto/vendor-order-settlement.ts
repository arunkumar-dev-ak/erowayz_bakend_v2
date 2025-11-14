import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumberString, IsOptional } from 'class-validator';

export class VendorOrderSettlementQueryDto {
  @ApiProperty({
    description: 'Start date and time of the banner',
    example: '2024-09-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  date: Date;

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
