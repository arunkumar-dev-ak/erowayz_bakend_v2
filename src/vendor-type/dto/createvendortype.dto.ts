import { ApiProperty } from '@nestjs/swagger';
import { Status, VendorCategoryType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVendorTypeDto {
  @ApiProperty({ description: 'name should not be empty', required: true })
  @IsString()
  @IsNotEmpty({ message: 'name should not be empty' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'tamilName is required' })
  tamilName: string;

  @ApiProperty({
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

  @ApiProperty({
    format: 'binary',
    required: true,
    type: 'string',
  })
  imageRef: Express.Multer.File;

  @ApiProperty({
    description: 'Type should be either SERVICE or PRODUCT',
    required: true,
    enum: VendorCategoryType,
  })
  @IsEnum(VendorCategoryType, {
    message: 'type should be either SERVICE or PRODUCT',
  })
  type: VendorCategoryType;
}
