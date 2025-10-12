import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginSubAdminDto {
  @ApiProperty({ description: 'Email is required', required: true })
  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'Password is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
