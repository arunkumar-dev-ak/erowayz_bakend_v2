import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { KeyWordType, Status, VendorCategoryType } from '@prisma/client';

export class GetKeyWordQueryDto {
  @ApiPropertyOptional({
    description: 'Filter keyword by vendorType ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsOptional()
  @IsNotEmpty({ message: 'vendorTypeId must not empty' })
  vendorTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter keyword by keyword name',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'keywordName must not empty' })
  keywordName?: string;

  @ApiPropertyOptional({
    description: 'Filter keyword by keyword Id',
    type: String,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'keywordId must not empty' })
  keywordId?: string;

  @ApiPropertyOptional({
    description: `KeyWordType must be one of: ${Object.values(KeyWordType).join(', ')}`,
    type: String,
  })
  @IsOptional()
  @IsEnum(KeyWordType, {
    message: `KeyWordType must be one of: ${Object.values(KeyWordType).join(', ')}`,
  })
  keyWordType?: KeyWordType;

  @ApiPropertyOptional({
    description: `VendorCategoryType must be one of: ${Object.values(VendorCategoryType).join(', ')}`,
    type: String,
  })
  @IsOptional()
  @IsEnum(VendorCategoryType, {
    message: `VendorCategoryType must be one of: ${Object.values(VendorCategoryType).join(', ')}`,
  })
  vendorCategoryType: VendorCategoryType;

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
