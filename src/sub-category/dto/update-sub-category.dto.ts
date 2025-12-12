import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

  @ApiProperty({
    format: 'binary',
    required: false,
    type: 'string',
  })
  subCategoryImage?: Express.Multer.File;
}
