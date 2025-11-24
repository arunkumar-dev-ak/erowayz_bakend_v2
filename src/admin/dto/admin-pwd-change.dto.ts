import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminPasswordChangeDto {
  @ApiProperty({ description: 'email is required' })
  @IsString()
  @IsNotEmpty({ message: ' email is required' })
  oldPassword: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  newPassword: string;
}
