import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DynamicContext, Status } from '@prisma/client';

export class GetDynamicFieldQueryDto {
  @ApiPropertyOptional({
    description: 'Filter Dynamic Field by Dynamic Field Id',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Dynamic FieldId must not empty' })
  label?: string;

  @ApiPropertyOptional({
    description: 'Filter Dynamic Field by Dynamic Field Id',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Dynamic FieldId must not empty' })
  id?: string;

  @ApiPropertyOptional({
    description: 'Context in which this dynamic field will be used',
    enum: DynamicContext,
    example: DynamicContext.BLOOD_REQUEST,
    required: true,
  })
  @IsOptional()
  @IsEnum(DynamicContext, {
    message: `Context must be one of: ${Object.values(DynamicContext).join(', ')}`,
  })
  context: DynamicContext;

  @ApiPropertyOptional({
    description: 'Status of the dynamic field',
    enum: Status,
    example: Status.ACTIVE,
    required: true,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  status: Status;

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
