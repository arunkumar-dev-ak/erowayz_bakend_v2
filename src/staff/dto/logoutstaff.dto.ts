import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutStaffDto {
  @ApiProperty({ description: 'Refresh Token is required', required: true })
  @ApiProperty({ description: 'Refresh token', required: true })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
