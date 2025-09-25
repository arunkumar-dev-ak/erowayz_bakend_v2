// dto/update-terms-and-condition.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateTermsAndConditionDto {
  @ApiProperty({
    description: 'User type for terms and conditions',
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
    description: 'Terms and conditions content in HTML format (English)',
    required: false,
    example:
      '<h1>Updated Terms and Conditions</h1><p>These are our updated terms...</p>',
  })
  @IsString()
  @IsOptional()
  termsAndConditionHtml?: string;

  @ApiProperty({
    description: 'Terms and conditions content in HTML format (Tamil)',
    required: false,
    example:
      '<h1>புதுப்பிக்கப்பட்ட விதிமுறைகள்</h1><p>இவை எங்கள் புதுப்பிக்கப்பட்ட விதிமுறைகள்...</p>',
  })
  @IsString()
  @IsOptional()
  termsAndConditionHtmlTa?: string;
}
