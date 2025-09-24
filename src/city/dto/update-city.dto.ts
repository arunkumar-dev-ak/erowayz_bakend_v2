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

@ValidatorConstraint({ name: 'ValidateUpdateForCity', async: false })
export class ValidUpdateCityConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as UpdateCityDto;

    // Check that at least one of these fields is provided
    return object.name !== undefined || object.status !== undefined;
  }

  defaultMessage(): string {
    return `At least one of 'name' or 'status' must be provided`;
  }
}

export class UpdateCityDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
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

  @Validate(ValidUpdateCityConstraint)
  validationTrigger?: string;
}
