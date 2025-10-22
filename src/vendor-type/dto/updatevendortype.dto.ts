import { ApiProperty } from '@nestjs/swagger';
import { VendorCategoryType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateVendorTypeDto {
  @ApiProperty({
    description: 'Name should not be empty, if defined',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'tamilName is required' })
  @IsOptional()
  tamilName?: string;

  @ApiProperty({
    description: 'Type should be either SERVICE or PRODUCT, if defined',
    required: false,
  })
  @IsOptional()
  @IsEnum(VendorCategoryType, {
    message: 'Type should be either SERVICE or PRODUCT',
  })
  type?: VendorCategoryType;

  @ApiProperty({
    format: 'binary',
    required: false,
    type: 'string',
  })
  image?: Express.Multer.File;
}
