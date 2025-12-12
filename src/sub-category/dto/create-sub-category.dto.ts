import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

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
