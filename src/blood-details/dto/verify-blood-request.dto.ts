import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum AdminBloodVerificationAction {
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class VerifyBloodRequestDto {
  @ApiProperty({
    description: 'Verification decision by Admin (VERIFIED or REJECTED)',
    enum: AdminBloodVerificationAction,
    example: AdminBloodVerificationAction.VERIFIED,
  })
  @IsEnum(AdminBloodVerificationAction, {
    message: 'verificationStatus must be either VERIFIED or REJECTED',
  })
  verificationStatus: AdminBloodVerificationAction;

  @ApiPropertyOptional({
    description:
      'Reason for rejecting the document (required when verificationStatus is REJECTED)',
    example: 'Document image is blurry and hospital stamp is missing',
  })
  @ValidateIf(
    (o) => o.verificationStatus === AdminBloodVerificationAction.REJECTED,
  )
  @IsString()
  @IsNotEmpty({
    message: 'rejectionReason is required when rejecting a blood request',
  })
  rejectionReason?: string;
}
