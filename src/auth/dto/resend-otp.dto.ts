import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({ description: 'OTP ID is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'OTP ID is required' })
  otpId: string;

  @ApiProperty({
    description: 'Type of OTP request',
    enum: ['Register', 'Login'],
    required: true,
  })
  @IsString()
  @IsIn(['Register', 'Login'], {
    message: 'Type must be either Register or Login',
  })
  type: 'Register' | 'Login';
}
