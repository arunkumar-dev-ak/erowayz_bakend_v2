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

export class TempRegisterDto {
  @ApiProperty({ description: 'Name is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ description: 'NameTamil is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'NameTamil is required' })
  @IsOptional()
  nameTamil?: string;

  @ApiProperty({ description: 'Mobile is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Mobile is required' })
  @Matches(/^\d{10}$/, { message: 'Mobile number must have 10 digits' })
  mobile: string;

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
    description:
      'Password is required andmust contain at least one uppercase letter, one lowercase letter, one number, one special character, and must be longer than 8 characters ',
    required: true,
  })
  @IsString()
  // @IsNotEmpty({ message: 'password is required' })
  @IsOptional()
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and must be longer than 8 characters.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  password: string;

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

  @ApiProperty({ description: 'FCM Token', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'FCM Token must not be empty, if defined' })
  @Matches(/^[a-zA-Z0-9\-_:]+$/, {
    message: 'Invalid FCM token format',
  })
  fcmToken?: string;

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

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  imageRef: Express.Multer.File;
}
