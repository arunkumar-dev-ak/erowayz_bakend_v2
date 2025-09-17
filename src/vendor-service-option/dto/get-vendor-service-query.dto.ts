import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class GetVendorServiceQueryDto {
  @ApiPropertyOptional({
    description: 'Filter vendorServiceOption by service name',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'name must not empty' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter vendorServiceOption by service Id',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'serviceId must not empty' })
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Filter vendorServiceOption by vendorId',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'vendorId must not empty' })
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Filter vendorServiceOption by subservice name',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'subservice name must not empty' })
  subServiceName?: string;

  @ApiPropertyOptional({
    description: 'Filter vendorServiceOption by subservice id',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'subservice Id must not empty' })
  subServiceId?: string;

  @ApiPropertyOptional({
    description: ' status: ACTIVE, INACTIVE,(default: ALL)',
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: ' Status is either ACTIVE or INACTIVE',
  })
  status?: Status;

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
