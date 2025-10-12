import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Name is required, if defined', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

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
  categoryImage?: Express.Multer.File;
}
