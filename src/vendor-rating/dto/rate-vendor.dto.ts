import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// 🍔 1. Street Food Vendors (VendorCategoryType.PRODUCT)
export class StreetFoodRatingDto {
  @ApiProperty({
    description: 'Hygiene & Cleanliness (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  hygiene!: number;

  @ApiProperty({
    description: 'Vendor Hospitality (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  hospitality!: number;

  @ApiProperty({
    description: 'Serving Speed (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  speed!: number;

  @ApiProperty({ description: 'Food Taste (1 to 5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  foodTaste!: number;

  @ApiProperty({
    description: 'Value for Money (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  valueForMoney!: number;
}

// 🛍️ 2. Common Shop Vendors (VendorCategoryType.BANNER)
export class CommonShopRatingDto {
  @ApiProperty({
    description: 'Product Quality (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  productQuality!: number;

  @ApiProperty({
    description: 'Product Availability (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  productAvailability!: number;

  @ApiProperty({
    description: 'Vendor Behaviour (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  vendorBehaviour!: number;

  @ApiProperty({
    description: 'Price & Value for Money (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  priceAndValue!: number;

  @ApiProperty({
    description: 'Customer Service (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  customerService!: number;
}

// 🔧 3. Vehicle & Service Vendors (VendorCategoryType.SERVICE)
export class ServiceRatingDto {
  @ApiProperty({
    description: 'Service Quality (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  serviceQuality!: number;

  @ApiProperty({
    description: 'Service Speed (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  serviceSpeed!: number;

  @ApiProperty({
    description: 'Technician Behaviour (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  technicianBehaviour!: number;

  @ApiProperty({
    description: 'Pricing & Value for Money (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  pricingAndValue!: number;

  @ApiProperty({
    description: 'Service Reliability (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  serviceReliability!: number;
}

// ⚖️ Constraint Validator for RateVendorDto
@ValidatorConstraint({ name: 'VendorRatingConstraint', async: false })
export class VendorRatingConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const dto = args.object as RateVendorDto;

    // 1. Target check: either orderId or bookingId must be provided (not both empty, not both filled)
    const hasOrderId =
      typeof dto.orderId === 'string' && dto.orderId.trim().length > 0;
    const hasBookingId =
      typeof dto.bookingId === 'string' && dto.bookingId.trim().length > 0;
    const hasTarget =
      (hasOrderId || hasBookingId) && !(hasOrderId && hasBookingId);

    // 2. Content check: at least one rating breakdown OR review text (or both combined)
    const hasRating =
      !!dto.streetFoodRating || !!dto.commonShopRating || !!dto.serviceRating;
    const hasReview =
      typeof dto.review === 'string' && dto.review.trim().length > 0;
    const hasContent = hasRating || hasReview;

    return hasTarget && hasContent;
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as RateVendorDto;
    const hasOrderId =
      typeof dto.orderId === 'string' && dto.orderId.trim().length > 0;
    const hasBookingId =
      typeof dto.bookingId === 'string' && dto.bookingId.trim().length > 0;

    if (!hasOrderId && !hasBookingId) {
      return 'Either orderId or bookingId must be provided';
    }
    if (hasOrderId && hasBookingId) {
      return 'Provide either orderId or bookingId, not both';
    }
    return 'At least one rating parameter breakdown or review text must be provided';
  }
}

// 📋 Main Rate Vendor DTO
export class RateVendorDto {
  @ApiPropertyOptional({
    description:
      'Order ID (UUID or orderId string) for Street Food or Common Shop orders',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'orderId should not be empty if defined' })
  orderId?: string;

  @ApiPropertyOptional({
    description:
      'Booking ID (UUID or bookedId string) for Service or Banner bookings',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'bookingId should not be empty if defined' })
  bookingId?: string;

  @ApiPropertyOptional({
    description:
      'Rating breakdown for Street Food Vendor (VendorCategoryType.PRODUCT)',
    type: StreetFoodRatingDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StreetFoodRatingDto)
  streetFoodRating?: StreetFoodRatingDto;

  @ApiPropertyOptional({
    description:
      'Rating breakdown for Common Shop Vendor (VendorCategoryType.BANNER)',
    type: CommonShopRatingDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CommonShopRatingDto)
  commonShopRating?: CommonShopRatingDto;

  @ApiPropertyOptional({
    description:
      'Rating breakdown for Service Vendor (VendorCategoryType.SERVICE)',
    type: ServiceRatingDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceRatingDto)
  serviceRating?: ServiceRatingDto;

  @ApiPropertyOptional({
    description: 'Optional feedback / review text',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'review should not be empty if defined' })
  review?: string;

  @Validate(VendorRatingConstraint)
  validationTrigger?: string;
}
