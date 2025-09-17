import { ApiProperty } from '@nestjs/swagger';
import { BloodGroups } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

export class TestRegisterDto {
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Mobile number must have 10 digits' })
  mobile: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

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
  @IsNotEmpty({ message: 'email is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  email: string;

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

  @ApiProperty({ description: 'FCM Token', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'FCM Token must not be empty, if defined' })
  @Matches(/^[a-zA-Z0-9\-_:]+$/, {
    message: 'Invalid FCM token format',
  })
  fcmToken?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  imageRef: Express.Multer.File;
}
