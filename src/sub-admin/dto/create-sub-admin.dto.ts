import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

export class CreateSubAdminDto {
  @ApiProperty({ description: 'Name is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

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
  @IsNotEmpty({ message: 'password is required' })
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and must be longer than 8 characters.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  password: string;

  @ApiProperty({ description: 'Status is either true or false' })
  @IsEnum(TrueOrFalseStatus, {
    message: `Status must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  @IsNotEmpty({ message: 'status is required' })
  status: TrueOrFalseStatus;
}
