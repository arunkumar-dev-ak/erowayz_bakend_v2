import { ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerReportStatus } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAdminCustomerReportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: CustomerReportStatus,
  })
  @IsOptional()
  @IsEnum(CustomerReportStatus, {
    message: `Status must be one of: ${Object.values(CustomerReportStatus).join(', ')}`,
  })
  status?: CustomerReportStatus;

  @ApiPropertyOptional({
    description: 'Filter by target transaction type (ORDER or BOOKING)',
    enum: ['ORDER', 'BOOKING'],
  })
  @IsOptional()
  @IsIn(['ORDER', 'BOOKING'], {
    message: 'targetType must be either ORDER or BOOKING',
  })
  targetType?: 'ORDER' | 'BOOKING';

  @ApiPropertyOptional({
    description: 'Search by customer name, reason, orderId, or bookedId',
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
