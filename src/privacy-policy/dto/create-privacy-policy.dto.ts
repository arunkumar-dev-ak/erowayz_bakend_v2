// dto/create-privacy-policy.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PrivacyPolicyType, UserType } from '@prisma/client';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreatePrivacyPolicyDto {
  @ApiProperty({
    description: 'User type for privacy policy',
    enum: UserType,
    example: UserType.VENDOR,
  })
  @IsEnum(UserType, {
    message: `userType must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  userType: UserType;

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
    example: '<h1>Privacy Policy</h1><p>This is our privacy policy...</p>',
  })
  @IsString()
  @IsNotEmpty({ message: 'Privacy policy HTML content is required' })
  privacyPolicyHtml: string;

  @ApiProperty({
    description: 'Privacy policy content in HTML format (Tamil)',
    example:
      '<h1>தனியுரிமைக் கொள்கை</h1><p>இது எங்கள் தனியுரிமைக் கொள்கை...</p>',
  })
  @IsString()
  @IsNotEmpty({ message: 'Privacy policy HTML content in Tamil is required' })
  privacyPolicyHtmlTa: string;

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
