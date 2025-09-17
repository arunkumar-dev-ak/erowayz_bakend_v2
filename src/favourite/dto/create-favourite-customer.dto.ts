import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'validateFieldsOnCreateFavourite', async: false })
export class ValidateFieldsOnCreateFavourite
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const obj = args?.object as CreateFavouriteCustomerForVendorDto;

    const isBookingId = obj?.bookingId;
    const isOrderId = obj?.orderItemId;

    if ((isBookingId && isOrderId) || (!isBookingId && !isOrderId)) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Either bookingId or orderItemId must be provided, but not both.`;
  }
}

export class CreateFavouriteCustomerForVendorDto {
  @ApiPropertyOptional({
    description: 'Booking ID related to the favorite action (optional)',
    example: 'booking-uuid-5678',
  })
  @IsString({ message: 'bookingId must be a string' })
  @IsOptional()
  @IsNotEmpty({ message: 'BookingId is required' })
  bookingId?: string;

  @ApiPropertyOptional({
    description: 'Order Item ID related to the favorite action (optional)',
    example: 'order-uuid-91011',
  })
  @IsString({ message: 'order Item Id must be a string' })
  @IsOptional()
  @IsNotEmpty({ message: 'Order Item Id is required' })
  orderItemId?: string;

  @Validate(ValidateFieldsOnCreateFavourite)
  validationTrigger?: string;
}
