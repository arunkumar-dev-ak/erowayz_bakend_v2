import { ApiPropertyOptional } from '@nestjs/swagger';
import { BloodGroups } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { TrueOrFalseStatus } from './edit-user.dto';

export class AdminEditUserDto {
  @ApiPropertyOptional({ description: 'Name of the user' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Tamil name of the user' })
  @IsString()
  @IsOptional()
  nameTamil?: string;

  @ApiPropertyOptional({ description: 'Mobile of the user' })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({ description: 'Email of the user' })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  email?: string;

  @ApiPropertyOptional({
    description: 'Active status of the user',
    enum: TrueOrFalseStatus,
  })
  @IsEnum(TrueOrFalseStatus)
  @IsOptional()
  status?: TrueOrFalseStatus;

  @ApiPropertyOptional({
    description: 'Whether user is a blood donor',
    enum: TrueOrFalseStatus,
  })
  @IsEnum(TrueOrFalseStatus)
  @IsOptional()
  isDonor?: TrueOrFalseStatus;

  @ApiPropertyOptional({
    description: 'Blood group of the user',
    enum: BloodGroups,
  })
  @IsEnum(BloodGroups)
  @IsOptional()
  bloodGroup?: BloodGroups;

  @ApiPropertyOptional({ description: 'City of the user' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Area of the user' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  imageRef?: Express.Multer.File;
}
