import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BloodGroups } from '@prisma/client';

export class GetBloodDetailsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter Dynamic Field by Dynamic Field Id',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Dynamic FieldId must not empty' })
  userName?: string;

  @ApiPropertyOptional({
    description: 'Filter Dynamic Field by Dynamic Field Id',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Dynamic FieldId must not empty' })
  id?: string;

  @ApiPropertyOptional({
    description: 'Filter by land',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Filter by land' })
  land?: string;

  @ApiPropertyOptional({
    description: 'Context in which this dynamic field will be used',
    enum: BloodGroups,
    example: BloodGroups.AB_NEGATIVE,
    required: true,
  })
  @IsOptional()
  @IsEnum(BloodGroups, {
    message: `Context must be one of: ${Object.values(BloodGroups).join(', ')}`,
  })
  bloodGroup?: BloodGroups;

  @ApiPropertyOptional({
    description: 'Status of the dynamic field',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  isDonor?: boolean;

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
