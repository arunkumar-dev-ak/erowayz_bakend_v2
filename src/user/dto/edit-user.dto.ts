import { ApiProperty } from '@nestjs/swagger';
import { BloodGroups } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsEmail,
} from 'class-validator';

export enum TrueOrFalseStatus {
  TRUE = 'true',
  FALSE = 'false',
}

// This is a constant, not a map syntax
export const TrueOrFalseMap = {
  true: true,
  false: false,
};

export class EditUserDto {
  @ApiProperty({ description: 'Name of the user', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name is required' })
  name?: string;

  @ApiProperty({ description: 'NameTamil of the user', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'NameTamil is required' })
  nameTamil?: string;

  @ApiProperty({
    description: 'Whether the user is a donor',
    enum: TrueOrFalseStatus,
    required: false,
  })
  @IsEnum(TrueOrFalseStatus, {
    message: `isDonor must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  @IsOptional()
  isDonor?: TrueOrFalseStatus;

  @ApiProperty({ description: 'Email is required', required: true })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty({ message: 'email is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  email?: string;

  @ApiProperty({
    description: 'Blood group of the user',
    enum: BloodGroups,
    required: false,
  })
  @IsEnum(BloodGroups, {
    message: `BloodGroup must be one of: ${Object.values(BloodGroups).join(', ')}`,
  })
  @IsOptional()
  bloodGroup?: BloodGroups;

  @ApiProperty({ description: 'City of the user', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'City is required' })
  city?: string;

  @ApiProperty({ description: 'Area of the user', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Area is required' })
  area?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  imageRef?: Express.Multer.File;
}
