import { ApiProperty } from '@nestjs/swagger';
import { ErrorLogStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  Validate,
  IsEnum,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

export class UpdateErrorLogDto {
  @ApiProperty({
    description: 'Error log status',
    enum: ErrorLogStatus,
    required: false,
  })
  @IsEnum(ErrorLogStatus, {
    message: `ErrorLogStatus must be one of: ${Object.values(ErrorLogStatus).join(', ')}`,
  })
  @IsOptional()
  errorLogStatus?: ErrorLogStatus;

  @ApiProperty({
    type: 'array',
    description: 'KeyWord Ids array must have atleast 1 ids',
    required: true,
  })
  @IsArray({ message: 'KeyWord must be in an array format' })
  @IsNotEmpty({ message: 'uploadedFileIds are required' })
  @IsString({ each: true, message: 'Each uploadedFileIds must be a string' })
  @Validate(IsUniqueArrayConstraint)
  @IsOptional()
  uploadedFileIds?: string[];
}
