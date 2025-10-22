// dto/create-terms-and-condition.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TermsAndConditionType, UserType } from '@prisma/client';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateTermsAndConditionDto {
  @ApiProperty({
    description: 'User type for terms and conditions',
    enum: UserType,
    example: UserType.VENDOR,
  })
  @IsEnum(UserType, {
    message: `userType must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  userType: UserType;

  @ApiProperty({
    description: 'Privacy Policy type for privacy policy',
    enum: TermsAndConditionType,
    example: TermsAndConditionType.BLOOD,
  })
  @IsEnum(TermsAndConditionType, {
    message: `termsAndConditionType must be one of the '${Object.values(TermsAndConditionType).join(', ')}'`,
  })
  @IsOptional()
  type?: TermsAndConditionType;

  @ApiProperty({
    description: 'Vendor type ID (required for VENDOR user type)',
    required: false,
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID(4, { message: 'vendorTypeId must be a valid UUID' })
  vendorTypeId?: string;

  @ApiProperty({
    description: 'Terms and conditions content in HTML format (English)',
    example: '<h1>Terms and Conditions</h1><p>These are our terms...</p>',
  })
  @IsString()
  @IsNotEmpty({ message: 'Terms and conditions HTML content is required' })
  termsAndConditionHtml: string;

  @ApiProperty({
    description: 'Terms and conditions content in HTML format (Tamil)',
    example:
      '<h1>விதிமுறைகள் மற்றும் நிபந்தனைகள்</h1><p>இவை எங்கள் விதிமுறைகள்...</p>',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Terms and conditions HTML content in Tamil is required',
  })
  termsAndConditionHtmlTa: string;
}
