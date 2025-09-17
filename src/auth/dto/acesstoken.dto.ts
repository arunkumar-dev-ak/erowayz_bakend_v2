import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccessTokenDto {
  @ApiProperty({ description: 'RefreshToken is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token should not be empty' })
  refreshToken: string;
}
