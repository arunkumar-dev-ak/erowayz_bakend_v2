import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'CustomerReportTargetConstraint', async: false })
export class CustomerReportTargetConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreateCustomerReportDto;
    const hasOrderId =
      typeof dto.orderId === 'string' && dto.orderId.trim().length > 0;
    const hasBookingId =
      typeof dto.bookingId === 'string' && dto.bookingId.trim().length > 0;

    return (hasOrderId || hasBookingId) && !(hasOrderId && hasBookingId);
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as CreateCustomerReportDto;
    const hasOrderId =
      typeof dto.orderId === 'string' && dto.orderId.trim().length > 0;
    const hasBookingId =
      typeof dto.bookingId === 'string' && dto.bookingId.trim().length > 0;

    if (!hasOrderId && !hasBookingId) {
      return 'Either orderId or bookingId must be provided';
    }
    return 'Provide either orderId or bookingId, not both';
  }
}

export class CreateCustomerReportDto {
  @ApiPropertyOptional({
    description: 'Order ID (UUID or display orderId) being reported',
    example: 'ORD-1001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'orderId cannot be empty if provided' })
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Booking ID (UUID or display bookedId) being reported',
    example: 'BKG-1001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'bookingId cannot be empty if provided' })
  bookingId?: string;

  @ApiProperty({
    description: 'Customer concern / report description (text only)',
    example: 'Food arrived spilled and missing 1 item.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Report reason is required' })
  @MaxLength(1000, { message: 'Report reason cannot exceed 1000 characters' })
  reason: string;

  @Validate(CustomerReportTargetConstraint)
  validationTrigger?: string;
}
