import { ApiProperty } from '@nestjs/swagger';
import { DynamicContext, Status, FieldType } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  IsArray,
} from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

@ValidatorConstraint({ name: 'ValidateSelectOption', async: false })
export class ValidateCreateDynamicConstraint
  implements ValidatorConstraintInterface
{
  validate(selectOptions: string[], args: ValidationArguments) {
    const obj = args.object as CreateDynamicFieldDto;

    // For SINGLE_SELECT or MULTI_SELECT, selectOptions must exist and be non-empty
    if (
      (obj.type === FieldType.SINGLE_SELECT ||
        obj.type === FieldType.MULTI_SELECT) &&
      (!obj.selectOptions || obj.selectOptions.length === 0)
    ) {
      return false;
    }

    // Check uniqueness of options if present
    if (obj.selectOptions) {
      const uniqueValues = new Set(obj.selectOptions);
      if (uniqueValues.size !== obj.selectOptions.length) {
        return false;
      }
    }

    return true;
  }

  defaultMessage() {
    return `Select options must be provided and unique if field type is SINGLE_SELECT or MULTI_SELECT`;
  }
}

export class CreateDynamicFieldDto {
  @ApiProperty({
    description: 'Label for the field (e.g., Patient Name)',
    example: 'Patient Name',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Label should not be empty' })
  label: string;

  @ApiProperty({
    description: 'Type of the field (e.g., TEXT, NUMBER, SELECT)',
    enum: FieldType,
    required: true,
  })
  @IsEnum(FieldType, {
    message: `Type must be one of: ${Object.values(FieldType).join(', ')}`,
  })
  type: FieldType;

  @ApiProperty({
    description:
      'Select options, required only for SINGLE_SELECT or MULTI_SELECT types',
    example: ['A+', 'B+', 'O-'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Validate(ValidateCreateDynamicConstraint)
  selectOptions = [];

  @ApiProperty({
    description: 'Whether the field is required',
    enum: TrueOrFalseStatus,
    required: false,
  })
  @IsEnum(TrueOrFalseStatus, {
    message: `isRequired must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  isRequired: TrueOrFalseStatus;

  @ApiProperty({
    description: 'Regex pattern string for validation',
    example: '^[0-9]{6}$',
    required: false,
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({
    description: 'Error message to show when validation fails',
    example: 'Must be a 6-digit pincode',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiProperty({
    description: 'Context in which this dynamic field will be used',
    enum: DynamicContext,
    example: DynamicContext.BLOOD_REQUEST,
    required: true,
  })
  @IsEnum(DynamicContext, {
    message: `Context must be one of: ${Object.values(DynamicContext).join(', ')}`,
  })
  context: DynamicContext;

  @ApiProperty({
    description: 'Status of the dynamic field',
    enum: Status,
    example: Status.ACTIVE,
    required: true,
  })
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  status: Status;
}
