import { ApiProperty } from '@nestjs/swagger';
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

export class UpdateSubAdminDto {
  @ApiProperty({ description: 'Name Should not be empty, if defined' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name?: string;

  @ApiProperty({ description: 'Email Should not be empty, if defined' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  @IsNotEmpty({ message: 'Email is required' })
  email?: string;

  @ApiProperty({
    description:
      'Password Should not be empty, if defined and it  must contain at least one uppercase letter, one lowercase letter, one number, one special character, and must be longer than 8 characters',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and must be longer than 8 characters.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  password?: string;

  @ApiProperty({
    description: 'Status should contain either true or false, if defined',
  })
  @IsOptional()
  @IsEnum(TrueOrFalseStatus, {
    message: `isDonor must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  @IsNotEmpty({ message: 'status is required' })
  status?: TrueOrFalseStatus;
}
