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
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

@ValidatorConstraint({ name: 'OrderStatusConstraint', async: false })
export class OrderStatusConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const dto = args.object as ChangeOrderStatusDto;

    const { orderStatus, isPaidByCash } = dto;

    const isDelivered = orderStatus === OrderStatus.DELIVERED;
    const isPaidByCashPresent = !!isPaidByCash;

    if (!isDelivered && isPaidByCashPresent) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'The field "isPaidByCash" should only be provided when the order status is DELIVERED.';
  }
}

export class ChangeOrderStatusDto {
  @ApiProperty({
    description: 'Status of the order',
    required: true,
    example: 'CANCELLED',
    enum: OrderStatus,
  })
  @IsString()
  @IsEnum(OrderStatus, {
    message:
      'Order status must be one of: PENDING, IN_PROGRESS, COMPLETED, or CANCELLED.',
  })
  orderStatus: OrderStatus;

  @ApiProperty({
    description:
      'Specifies whether the order was paid by cash (only applicable when status is DELIVERED)',
    enum: TrueOrFalseStatus,
    required: false,
    example: TrueOrFalseStatus.TRUE,
  })
  @IsEnum(TrueOrFalseStatus, {
    message: `isPaidByCash must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'.`,
  })
  @Validate(OrderStatusConstraint)
  @IsOptional()
  isPaidByCash?: TrueOrFalseStatus;
}
