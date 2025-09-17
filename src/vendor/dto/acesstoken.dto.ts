import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccessTokenDto {
  @ApiProperty({
    description: 'Refresh token should not be empty',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token should not be empty' })
  refreshToken: string;
}
