import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServiceOptionDto {
  @ApiProperty({ description: 'Name is required', required: true })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'tamilName is required' })
  tamilName: string;

  @ApiProperty({ description: 'Description is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ description: 'Vendor Type ID is required', required: true })
  @IsNotEmpty({ message: 'Vendor Type ID is required' })
  @IsString()
  vendorTypeId: string;

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
  serviceOptImage: Express.Multer.File;
}
