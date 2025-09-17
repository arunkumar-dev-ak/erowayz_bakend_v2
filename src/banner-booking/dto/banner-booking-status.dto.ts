import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'banner-bookingConstraint', async: false })
export class BannerBookingConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const dto = args.object as ChangeBannerBookingStatusDto;

    const isStatusCancelled = dto.orderStatus === 'CANCELLED';
    const isReason =
      dto.declinedReason !== undefined && dto.declinedReason != null;

    if ((isStatusCancelled && !isReason) || (!isStatusCancelled && isReason)) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'Provide either [itemId and totalQty] or [cartId], not both or partial.';
  }
}

export class ChangeBannerBookingStatusDto {
  @ApiProperty({
    description: 'orderStatus',
    required: true,
    example: 'CANCELLED',
    enum: OrderStatus,
  })
  @IsString()
  @IsEnum(OrderStatus, {
    message: 'BookingStatus are like PENDING,IN_PROGRESS,COMPLETED,CANCELLED',
  })
  orderStatus: OrderStatus;

  @ApiProperty({
    description: 'declinedReason',
    required: false,
    example: 'I accidentially booked',
  })
  @IsOptional()
  @IsString()
  @Validate(BannerBookingConstraint, {
    message:
      "Decline reason must be provided if the status is 'Cancelled', and must not be present if the status is anything else.",
  })
  declinedReason: string;
}
