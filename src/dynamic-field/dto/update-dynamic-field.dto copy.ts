import { ApiProperty } from '@nestjs/swagger';
import { FieldType, Status } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  Validate,
} from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

export class UpdateDynamicFieldDto {
  @ApiProperty({
    description: 'Label for the field (e.g., Patient Name)',
    example: 'Patient Name',
    required: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Label should not be empty' })
  label?: string;

  @ApiProperty({
    description: 'Type of the field (e.g., TEXT, NUMBER, SELECT)',
    enum: FieldType,
    required: true,
  })
  @IsOptional()
  @IsEnum(FieldType, {
    message: `Type must be one of: ${Object.values(FieldType).join(', ')}`,
  })
  type?: FieldType;

  @ApiProperty({
    description: 'Whether the field is required',
    enum: TrueOrFalseStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TrueOrFalseStatus, {
    message: `isRequired must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  isRequired?: TrueOrFalseStatus;

  @ApiProperty({
    description: 'Regex pattern string for validation',
    example: '^[0-9]{6}$',
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({
    description: 'Error message to show when validation fails',
    example: 'Must be a 6-digit pincode',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

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
  @Validate(IsUniqueArrayConstraint)
  selectOptions?: string[];

  @ApiProperty({
    description: 'Status of the dynamic field',
    enum: Status,
    example: Status.ACTIVE,
    required: true,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  status?: Status;
}
