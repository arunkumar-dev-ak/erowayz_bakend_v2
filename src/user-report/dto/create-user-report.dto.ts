import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserReportDto {
  @ApiProperty({
    example: 'order_12345',
    description: 'Order ID associated with the report (optional)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'orderId must be a string' })
  orderId?: string;

  @ApiProperty({
    example: 'booking_98765',
    description: 'Booking ID associated with the report (optional)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'bookingId must be a string' })
  bookingId?: string;

  @ApiProperty({
    example: 'User reported an issue with the order delivery',
    description: 'Report details describing the issue',
  })
  @IsNotEmpty({ message: 'report is required' })
  @IsString({ message: 'report must be a string' })
  report: string;
}
