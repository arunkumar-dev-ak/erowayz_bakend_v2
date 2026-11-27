import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodDocumentType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class RequestBloodDetailDto {
  @ApiProperty({
    description: 'Patient name',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Patient name must not be empty' })
  patientName: string;

  @ApiProperty({
    description: 'Patient mobile number (must be exactly 10 digits)',
    type: String,
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Patient mobile number must not be empty' })
  @Matches(/^\d{10}$/, {
    message: 'Patient mobile number must be exactly 10 digits',
  })
  patientMobileNumber: string;

  @ApiProperty({
    description: 'Hospital name',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Hospital name must not be empty' })
  hospitalName: string;

  @ApiPropertyOptional({
    description:
      'Verification document type (PATIENT_CASE_SHEET or CAMP_LETTERHEAD)',
    enum: BloodDocumentType,
  })
  @IsEnum(BloodDocumentType, {
    message:
      'documentType must be either PATIENT_CASE_SHEET or CAMP_LETTERHEAD',
  })
  @IsOptional()
  documentType?: BloodDocumentType;

  @ApiProperty({
    description: 'Dynamic field values based on configuration',
    type: 'object',
    additionalProperties: {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'array', items: { type: 'string' } },
      ],
    },
    example: {
      bloodGroup: 'A+',
      diseases: ['Malaria', 'Dengue'],
      phoneNumber: '1234567890',
    },
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject({ message: 'Dynamic fields must be an object' })
  @IsOptional()
  dynamicFields?: Record<string, any>;
}
