import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({
    description: 'Otp is required and must be 6 digits',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Otp is required' })
  @Matches(/^\d{6}$/, { message: 'Otp must be a 6-digit number' })
  otp: string;

  @ApiProperty({ description: 'OTP ID is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'OTP ID is required' })
  otpId: string;
}
