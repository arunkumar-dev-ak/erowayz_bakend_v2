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

@ValidatorConstraint({ name: 'service-bookingConstraint', async: false })
export class ServiceBookingConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const dto = args.object as ChangeBookingStatusDto;

    // const hasCart = !!dto.cartId;
    // const hasItem = !!dto.itemId;
    // const hasQty = dto.totalQty !== undefined && dto.totalQty !== null;

    // // Valid if only cartId is present OR both itemId and totalQty are present
    // if ((hasCart && !hasItem && !hasQty) || (!hasCart && hasItem && hasQty)) {
    //   return true;
    // }

    // return false;

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

export class ChangeBookingStatusDto {
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
  @Validate(ServiceBookingConstraint, {
    message:
      "Decline reason must be provided if the status is 'Cancelled', and must not be present if the status is anything else.",
  })
  declinedReason: string;
}
