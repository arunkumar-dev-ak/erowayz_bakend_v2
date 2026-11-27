import { ApiPropertyOptional } from '@nestjs/swagger';
import { VendorReportStatus } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAdminVendorReportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: VendorReportStatus,
  })
  @IsOptional()
  @IsEnum(VendorReportStatus, {
    message: `Status must be one of: ${Object.values(VendorReportStatus).join(', ')}`,
  })
  status?: VendorReportStatus;

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
    description:
      'Search by vendor name, shop name, mobile, reason, orderId, or bookedId',
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
