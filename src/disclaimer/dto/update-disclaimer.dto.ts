import { ApiProperty } from '@nestjs/swagger';
import { DisclaimerType } from '@prisma/client';
import { IsEnum, IsString, IsOptional } from 'class-validator';

export class UpdateDisclaimerDto {
  @ApiProperty({
    description: 'Type of disclaimer',
    enum: DisclaimerType,
    required: false,
    example: DisclaimerType.BANNER_BOOK, // Replace with actual enum value
  })
  @IsEnum(DisclaimerType, {
    message: 'disclaimerType must be a valid DisclaimerType enum value',
  })
  @IsOptional()
  disclaimerType?: DisclaimerType;

  @ApiProperty({
    description: 'Disclaimer content in HTML format (English)',
    required: false,
    example:
      '<h1>Updated Privacy Policy</h1><p>This is our updated privacy policy...</p>',
  })
  @IsString()
  @IsOptional()
  disclaimerHtml?: string;

  @ApiProperty({
    description: 'Disclaimer content in HTML format (Tamil)',
    required: false,
    example:
      '<h1>புதுப்பிக்கப்பட்ட தனியுரிமைக் கொள்கை</h1><p>இது எங்கள் புதுப்பிக்கப்பட்ட தனியுரிமைக் கொள்கை...</p>',
  })
  @IsString()
  @IsOptional()
  disclaimerHtmlTa?: string;
}
