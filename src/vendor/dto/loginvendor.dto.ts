import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class LoginVendorDto {
  @ApiProperty({ description: 'Uid is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'uid is required' })
  token: string;

  @ApiProperty({ description: 'FCM Token', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'FCM Token must not be empty, if defined' })
  @Matches(/^[a-zA-Z0-9\-_:]+$/, {
    message: 'Invalid FCM token format',
  })
  fcmToken?: string;
}
