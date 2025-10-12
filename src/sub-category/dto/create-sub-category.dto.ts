import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({
    description: 'Name is required',
    required: true,
    example: 'Electronics',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Name is required', required: true })
  @IsNotEmpty()
  @IsString()
  tamilName: string;

  @ApiProperty({
    description: 'Name is required',
    required: true,
    example: '0f62adde-9cc3-4c0a-ac0e-ac40f68c3328',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    format: 'binary',
    required: true,
    type: 'string',
  })
  subCategoryImage: Express.Multer.File;
}
