import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name is required', required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Name is required', required: true })
  @IsNotEmpty()
  @IsString()
  tamilName: string;

  @ApiProperty({ description: 'vendorTypeId is required', required: true })
  @IsNotEmpty()
  @IsString()
  vendorTypeId: string;

  @ApiProperty({
    format: 'binary',
    required: true,
    type: 'string',
  })
  categoryImage: Express.Multer.File;
}
