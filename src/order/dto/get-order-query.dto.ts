import { IsEnum, IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export class GetOrderQueryDto {
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
    description: 'Comma separated service option IDs',
    type: String,
  })
  @IsString()
  @IsOptional()
  serviceOptionsIds?: string;

  @ApiPropertyOptional({
    description: 'Payment method (COD or JUSPAY)',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod, {
    message: 'paymentMode must be either COD or JUSPAY',
  })
  @IsOptional()
  paymentMode?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Filter by multiple order statuses',
    enum: OrderStatus,
    isArray: true,
  })
  @IsEnum(OrderStatus, {
    message:
      'OrderStatus must be a of PENDING,IN_PROGRESS,COMPLETED,CANCELLED,DELIVERED',
  })
  @IsOptional()
  orderStatus?: OrderStatus;

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
}
