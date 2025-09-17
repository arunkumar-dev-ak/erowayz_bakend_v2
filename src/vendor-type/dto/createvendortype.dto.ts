import { ApiProperty } from '@nestjs/swagger';
import { VendorCategoryType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateVendorTypeDto {
  @ApiProperty({ description: 'name should not be empty', required: true })
  @IsString()
  @IsNotEmpty({ message: 'name should not be empty' })
  name: string;

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
