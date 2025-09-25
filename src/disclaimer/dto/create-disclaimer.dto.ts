import { ApiProperty } from '@nestjs/swagger';
import { DisclaimerType } from '@prisma/client';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export class CreateDisclaimerDto {
  @ApiProperty({
    description: 'Type of disclaimer',
    enum: DisclaimerType,
    example: DisclaimerType.SERVICE_BOOK, // Replace with actual enum value
  })
  @IsEnum(DisclaimerType, {
    message: 'disclaimerType must be a valid DisclaimerType enum value',
  })
  disclaimerType: DisclaimerType;

  @ApiProperty({
    description: 'Disclaimer content in HTML format (English)',
    example: '<h1>Privacy Policy</h1><p>This is our privacy policy...</p>',
  })
  @IsString()
  @IsNotEmpty()
  disclaimerHtml: string;

  @ApiProperty({
    description: 'Disclaimer content in HTML format (Tamil)',
    example:
      '<h1>தனியுரிமைக் கொள்கை</h1><p>இது எங்கள் தனியுரிமைக் கொள்கை...</p>',
  })
  @IsString()
  @IsNotEmpty()
  disclaimerHtmlTa: string;
}
