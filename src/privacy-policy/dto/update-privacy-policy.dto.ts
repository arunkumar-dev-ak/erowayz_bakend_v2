// dto/update-privacy-policy.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PrivacyPolicyType, UserType } from '@prisma/client';
import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdatePrivacyPolicyDto {
  @ApiProperty({
    description: 'User type for privacy policy',
    enum: UserType,
    required: false,
    example: UserType.VENDOR,
  })
  @IsEnum(UserType, {
    message: `userType must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  @IsOptional()
  userType?: UserType;

  @ApiProperty({
    description: 'Vendor type ID (required for VENDOR user type)',
    required: false,
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID(4, { message: 'vendorTypeId must be a valid UUID' })
  vendorTypeId?: string;

  @ApiProperty({
    description: 'Privacy policy content in HTML format (English)',
    required: false,
    example:
      '<h1>Updated Privacy Policy</h1><p>This is our updated privacy policy...</p>',
  })
  @IsString()
  @IsOptional()
  privacyPolicyHtml?: string;

  @ApiProperty({
    description: 'Privacy policy content in HTML format (Tamil)',
    required: false,
    example:
      '<h1>புதுப்பிக்கப்பட்ட தனியுரிமைக் கொள்கை</h1><p>இது எங்கள் புதுப்பிக்கப்பட்ட தனியுரிமைக் கொள்கை...</p>',
  })
  @IsString()
  @IsOptional()
  privacyPolicyHtmlTa?: string;

  @ApiProperty({
    description: 'Privacy Policy type for privacy policy',
    enum: PrivacyPolicyType,
    example: PrivacyPolicyType.BLOOD,
  })
  @IsEnum(PrivacyPolicyType, {
    message: `userType must be one of the '${Object.values(PrivacyPolicyType).join(', ')}'`,
  })
  @IsOptional()
  type?: PrivacyPolicyType;
}
