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

@ValidatorConstraint({ name: 'VendorReportTargetConstraint', async: false })
export class VendorReportTargetConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreateVendorReportDto;
    const hasOrderId =
      typeof dto.orderId === 'string' && dto.orderId.trim().length > 0;
    const hasBookingId =
      typeof dto.bookingId === 'string' && dto.bookingId.trim().length > 0;

    return (hasOrderId || hasBookingId) && !(hasOrderId && hasBookingId);
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as CreateVendorReportDto;
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

export class CreateVendorReportDto {
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
    description:
      'Vendor concern / report reason against customer (text only, e.g. customer refused COD, unreachable address)',
    example: 'Customer refused to pay COD amount and refused delivery.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Report reason is required' })
  @MaxLength(1000, { message: 'Report reason cannot exceed 1000 characters' })
  reason: string;

  @Validate(VendorReportTargetConstraint)
  validationTrigger?: string;
}
