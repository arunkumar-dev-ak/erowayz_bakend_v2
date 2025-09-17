import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLogoutDto {
  @ApiProperty({ description: 'Refresh token', required: true })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
