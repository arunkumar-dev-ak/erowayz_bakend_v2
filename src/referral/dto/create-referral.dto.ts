import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReferralDto {
  @ApiPropertyOptional({
    description: 'referralCode',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  referralCode: string;
}
