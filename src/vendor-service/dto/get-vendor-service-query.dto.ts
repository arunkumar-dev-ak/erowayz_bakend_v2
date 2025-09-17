import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsEnum,
} from 'class-validator';

export class GetServiceQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by Vendor ID (UUID)',
    type: String,
    example: 'c5f2559b-6844-405c-ada2-90e077175e5f',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'vendorId should not be empty' })
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Vendor ID (UUID)',
    type: String,
    example: 'c5f2559b-6844-405c-ada2-90e077175e5f',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'vendorId should not be empty' })
  keywordId?: string;

  @ApiPropertyOptional({
    description: 'Filter by SubService Name',
    type: String,
    example: 'Hair Cut',
  })
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Status of the sub-service',
    required: true,
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsEnum(Status, {
    message: `Invalid status. Must be one of: ${Object.values(Status).join(', ')}`,
  })
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({
    description: 'Pagination offset (defaults to 0)',
    type: Number,
    example: 0,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'offset must be a numeric string' })
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Pagination limit (defaults to 10)',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'limit must be a numeric string' })
  limit?: string = '10';
}
