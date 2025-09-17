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

  @ApiProperty({
    format: 'binary',
    required: false,
    type: 'string',
  })
  subCategoryImage?: Express.Multer.File;
}
