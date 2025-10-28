import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class GetPlatformFeeQueryDto {
  @ApiPropertyOptional({
    description: 'Filter License Category by name',
    type: String,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

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
