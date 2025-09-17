import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token', required: true })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({ description: 'FCM Token', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'FCM Token must not be empty, if defined' })
  @Matches(/^[a-zA-Z0-9\-_:]+$/, {
    message: 'Invalid FCM token format',
  })
  fcmToken?: string;
}
