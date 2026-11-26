import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export enum StockAlertFilter {
  ALL = 'ALL',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export class GetStockAlertsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter alerts by type (ALL, LOW_STOCK, OUT_OF_STOCK)',
    enum: StockAlertFilter,
    default: StockAlertFilter.ALL,
  })
  @IsOptional()
  @IsEnum(StockAlertFilter, {
    message: `filter must be one of: ${Object.values(StockAlertFilter).join(', ')}`,
  })
  filter?: StockAlertFilter = StockAlertFilter.ALL;

  @ApiPropertyOptional({
    description: 'Search by item name in English or Tamil',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
    example: 0,
  })
  @IsOptional()
  @IsNumberString()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
