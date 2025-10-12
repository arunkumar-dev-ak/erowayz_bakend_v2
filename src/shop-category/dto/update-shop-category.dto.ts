import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidateUpdateForShopCategory', async: false })
export class ValidUpdateShopCategoryConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as UpdateShopCategoryDto;

    // Check that at least one of these fields is provided
    return (
      object.name !== undefined ||
      object.tamilName !== undefined ||
      object.status !== undefined
    );
  }

  defaultMessage(): string {
    return `At least one of 'name' or 'status' or 'tamilName' must be provided`;
  }
}

export class UpdateShopCategoryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Name is required', required: true })
  @IsNotEmpty()
  @IsString()
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

  @Validate(ValidUpdateShopCategoryConstraint)
  validationTrigger?: string;
}
