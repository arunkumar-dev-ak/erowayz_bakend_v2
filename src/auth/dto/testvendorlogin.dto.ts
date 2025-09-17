import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class TestVendorLoginDto {
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Mobile number must have 10 digits' })
  mobile: string;

  @ApiProperty({ description: 'FCM Token', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'FCM Token must not be empty, if defined' })
  @Matches(/^[a-zA-Z0-9\-_:]+$/, {
    message: 'Invalid FCM token format',
  })
  fcmToken?: string;
}
