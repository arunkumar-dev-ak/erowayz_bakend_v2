import { ApiProperty } from '@nestjs/swagger';
import { BookingPaymentMethod } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastTwoMinutesAheadConstraint', async: false })
export class AtLeastTwoMinutesAheadConstraint
  implements ValidatorConstraintInterface
{
  validate(arrivalDateTime: Date) {
    const now = new Date();
    const minAllowedDate = new Date(now.getTime() + 2 * 60 * 1000);
    return arrivalDateTime > minAllowedDate;
  }

  defaultMessage() {
    return 'Arrival date and time must be at least 2 minutes ahead of the current time';
  }
}

export class CreateBannerBookingDto {
  @ApiProperty({ description: 'BannerId of the booked banner' })
  @IsString()
  @IsNotEmpty({ message: 'BannerId is required' })
  bannerId: string;

  @ApiProperty({
    description: 'Arrival date and time of booking',
    example: '2024-09-01T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  @Validate(AtLeastTwoMinutesAheadConstraint)
  arrivalDateTime: Date;

  @ApiProperty({
    description: 'paymentStatus',
    required: true,
    enum: BookingPaymentMethod,
  })
  @IsEnum(BookingPaymentMethod, {
    message: `Payment Method must be one of ${Object.values(BookingPaymentMethod).join(', ')}`,
  })
  preferredPaymentMethod: BookingPaymentMethod;
}
