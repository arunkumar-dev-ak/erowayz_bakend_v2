import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingPaymentMethod, OrderStatus } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetServiceBookingQueryDto {
  @ApiPropertyOptional({
    description: 'Start date in ISO string format (YYYY-MM-DD)',
    type: String,
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date in ISO string format (YYYY-MM-DD)',
    type: String,
  })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Preferred Payment method',
    type: String,
  })
  @IsEnum(BookingPaymentMethod, {
    message: `Payment Method must be one of ${Object.values(BookingPaymentMethod).join(', ')}`,
  })
  @IsOptional()
  preferredPaymentMethod?: BookingPaymentMethod;

  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  limit?: string = '10';

  @ApiPropertyOptional({
    description: 'BookedId',
    type: String,
  })
  @IsString()
  @IsOptional()
  bookedId?: string;

  @ApiPropertyOptional({
    description: 'BookingId',
    type: String,
  })
  @IsEnum(OrderStatus, {
    message: 'Orderstatus be like IN_PROGRESS,ACCEPTED,CANCELLED,DELIVERED',
  })
  @IsString()
  @IsOptional()
  orderStatus?: OrderStatus;
}
