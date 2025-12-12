import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  categoryImage?: Express.Multer.File;
}
