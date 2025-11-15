import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidateEqualLength', async: false })
export class ValidateEqualLength implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const obj = args.object as CreateVendorServiceDto;

    const prices = obj.price;
    const names = obj.subServiceName;

    return (
      Array.isArray(prices) &&
      Array.isArray(names) &&
      prices.length === names.length
    );
  }

  defaultMessage(): string {
    return `The number of prices must match the number of subservice names.`;
  }
}

export class CreateVendorServiceDto {
  @ApiProperty({
    description: 'Name of the vendor Service',
    required: true,
    example: 'Plumbing Fixing',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'nameTamil is required' })
  @IsOptional()
  nameTamil?: string;

  @ApiProperty({
    description: ' Service Option ID (UUID)',
    required: true,
    example: 'e13e1d8e-d5ac-4b76-a61a-bc9f8b123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ServiceOptId should not be empty' })
  serviceOptId: string;

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
  @IsEnum(Status, {
    message: `Invalid status. Must be one of: ${Object.values(Status).join(', ')}`,
  })
  status: Status;

  @ApiProperty({
    description: 'Subservice names',
    type: [String],
  })
  @ArrayMinSize(1, {
    message: 'You must provide at least one subservice',
  })
  @IsString({ each: true })
  subServiceName: string[];

  @ApiProperty({
    description: 'Subservice Price',
    type: [String],
  })
  @ArrayMinSize(1, {
    message: 'You must provide at least one subservice',
  })
  @IsString({ each: true })
  @Validate(ValidateEqualLength)
  price: string[];

  @ApiProperty({
    description: 'Files (images) for the vendor sub-service',
    required: false,
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  @IsOptional()
  files?: Express.Multer.File[];
}
