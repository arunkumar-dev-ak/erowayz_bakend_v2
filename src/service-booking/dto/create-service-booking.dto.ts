import { ApiProperty } from '@nestjs/swagger';
import { BookingPaymentMethod } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/temp-registervendor.dto';

export class CreateServiceBookingDto {
  @ApiProperty({
    type: 'array',
    description: 'VendorSubServiceId Ids array must have atleast 1 ids',
    required: true,
  })
  @IsArray({ message: 'VendorSubServiceId must be in an array format' })
  @IsNotEmpty({ message: 'VendorSubServiceId are required' })
  @IsString({
    each: true,
    message: 'Each VendorSubServiceId ID must be a string',
  })
  @Validate(IsUniqueArrayConstraint)
  vendorSubServiceId: string[];

  @ApiProperty({ description: 'Latitude must be between -90 and 90' })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsLatitude({ message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiProperty({ description: 'Longitude must be between -180 and 180' })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsLongitude({ message: 'Longitude must be between -180 and 180' })
  longitude?: number;

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
