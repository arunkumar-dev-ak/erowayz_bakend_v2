import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BloodDocumentType, BloodVerificationStatus } from '@prisma/client';

export class GetAdminBloodDetailQueryDto {
  @ApiPropertyOptional({
    description: 'Start date in ISO string format (YYYY-MM-DD)',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date in ISO string format (YYYY-MM-DD)',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'End date in ISO string format (YYYY-MM-DD)',
    type: String,
  })
  @IsString()
  @IsOptional()
  requesterName?: string;

  @ApiPropertyOptional({
    description: 'Filter by donor name',
    type: String,
  })
  @IsString()
  @IsOptional()
  donorName?: string;

  @ApiPropertyOptional({
    description: 'Filter by verification status',
    enum: BloodVerificationStatus,
  })
  @IsEnum(BloodVerificationStatus)
  @IsOptional()
  verificationStatus?: BloodVerificationStatus;

  @ApiPropertyOptional({
    description: 'Filter by document type',
    enum: BloodDocumentType,
  })
  @IsEnum(BloodDocumentType)
  @IsOptional()
  documentType?: BloodDocumentType;

  @ApiPropertyOptional({
    description: 'Pagination offset, defaults to 0',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit, defaults to 10',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  limit?: string = '10';
}
