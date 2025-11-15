import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

@ValidatorConstraint({ name: 'ValidateEqualLength', async: false })
export class ValidateEqualLengthOnUpdate
  implements ValidatorConstraintInterface
{
  validate(_value: any, args: ValidationArguments): boolean {
    const obj = args.object as UpdateVendorServiceDto;

    const prices = obj.price;
    const names = obj.subServiceName;

    if (!prices && !names) {
      return true;
    }

    if (!Array.isArray(prices) || !Array.isArray(names)) {
      return false;
    }

    return prices.length === names.length;
  }

  defaultMessage(): string {
    return `The number of prices must match the number of subservice names.`;
  }
}

export class UpdateVendorServiceDto {
  @ApiProperty({
    description: 'Name of the vendor Service',
    required: true,
    example: 'Plumbing Fixing',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'nameTamil is required' })
  @IsOptional()
  nameTamil?: string;

  @ApiProperty({
    description: ' Service Option ID (UUID)',
    required: true,
    example: 'e13e1d8e-d5ac-4b76-a61a-bc9f8b123456',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'ServiceOptId should not be empty' })
  serviceOptId?: string;

  @ApiProperty({
    description: 'Optional description for the Service',
    required: false,
    example: 'Fixing minor leaks and pipe fittings',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty' })
  description?: string;

  @ApiProperty({
    description: 'Status of the sub-service',
    required: true,
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Invalid status. Must be one of: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

  @ApiProperty({
    description: 'Subservice names',
    type: [String],
  })
  @ArrayMinSize(1, {
    message: 'You must provide at least one subservice',
  })
  @IsString({ each: true })
  @IsOptional()
  subServiceName: string[];

  @ApiProperty({
    description: 'Subservice Price',
    type: [String],
  })
  @ArrayMinSize(1, {
    message: 'You must provide at least one subservice',
  })
  @IsString({ each: true })
  @IsOptional()
  price: string[];

  @ApiProperty({
    type: 'array',
    description: 'Deleted Item ImageId',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Deleted Service ImageId must be in an array format' })
  @IsString({
    each: true,
    message: 'Each SubService Item ImageId must be a string',
  })
  @Validate(IsUniqueArrayConstraint)
  deletedServiceImageIds: string[];

  @ApiProperty({
    description: 'Files (images) for the vendor sub-service',
    required: false,
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  @IsOptional()
  files?: Express.Multer.File[];

  @Validate(ValidateEqualLengthOnUpdate)
  validationTrigger?: string;
}
