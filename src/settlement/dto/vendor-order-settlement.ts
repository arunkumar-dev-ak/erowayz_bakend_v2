import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class VendorOrderSettlementQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by month',
    type: String,
  })
  @IsNumberString()
  month: string;

  @ApiPropertyOptional({
    description: 'Filter by month',
    type: String,
  })
  @IsNumberString()
  year: string;

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
