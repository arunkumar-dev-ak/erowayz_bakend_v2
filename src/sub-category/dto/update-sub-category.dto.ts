import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSubCategoryDto {
  @IsOptional()
  @ApiProperty({
    description: 'Name is required, if defined',
    required: true,
    example: 'Electronics',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Name is required', required: true })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  tamilName?: string;

  @ApiProperty({
    format: 'binary',
    required: false,
    type: 'string',
  })
  subCategoryImage?: Express.Multer.File;
}
