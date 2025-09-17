import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { IsUniqueArrayConstraint } from './temp-registervendor.dto';
import { PaymentMethod } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateVendorDto {
  @ApiProperty({ description: 'Name is required', required: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name?: string;

  @ApiProperty({ description: 'nameTamil is required', required: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'nameTamil is required' })
  nameTamil?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  @IsOptional()
  vendorImageRef?: Express.Multer.File;

  @ApiProperty({ description: 'Email is required', required: true })
  @IsEmail()
  @IsNotEmpty({ message: 'email is required' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  email: string;

  @ApiProperty({
    type: 'array',
    description: 'Service Options Ids array must have atleast 1 ids',
    required: true,
  })
  @IsOptional()
  @IsArray({ message: 'Service Options must be in an array format' })
  @IsNotEmpty({ message: 'Service Options are required' })
  @IsString({ each: true, message: 'Each Service Option ID must be a string' })
  @Validate(IsUniqueArrayConstraint)
  serviceOptionIds: string[];

  @ApiProperty({
    description: 'Payment methods for the shop info',
    enum: PaymentMethod,
    isArray: true,
    example: [PaymentMethod.CASH, PaymentMethod.JUSPAY],
    required: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PaymentMethod, {
    each: true,
    message: `Each payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  @Validate(IsUniqueArrayConstraint)
  paymentMethod?: PaymentMethod[];

  @ApiProperty({
    type: 'array',
    description: 'KeyWord Ids array must have atleast 1 ids',
    required: true,
  })
  @IsOptional()
  @IsArray({ message: 'KeyWord must be in an array format' })
  @IsNotEmpty({ message: 'KeyWord are required' })
  @IsString({ each: true, message: 'Each KeyWord ID must be a string' })
  @Validate(IsUniqueArrayConstraint)
  keyWordIds?: string[];
}
