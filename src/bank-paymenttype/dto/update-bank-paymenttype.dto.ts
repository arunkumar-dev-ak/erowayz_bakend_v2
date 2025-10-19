import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidateUpdateForBankPaymentType', async: false })
export class ValidUpdateBankPaymentTypeConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as UpdateBankPaymentTypeDto;

    // Check that at least one of these fields is provided
    return (
      object.name !== undefined ||
      object.status !== undefined ||
      object.tamilName !== undefined
    );
  }

  defaultMessage(): string {
    return `At least one of 'name' or 'status' or 'tamilName' must be provided`;
  }
}

export class UpdateBankPaymentTypeDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'tamilName is required' })
  @IsOptional()
  tamilName?: string;

  @ApiProperty({
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

  @Validate(ValidUpdateBankPaymentTypeConstraint)
  validationTrigger?: string;
}
