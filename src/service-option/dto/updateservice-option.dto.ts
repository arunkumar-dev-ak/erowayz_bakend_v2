import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateServiceOptionDto {
  @IsOptional()
  @ApiProperty({ description: 'Name is required, if defined', required: false })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @ApiProperty({
    description: 'Description is required, if defined',
    required: false,
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Vendor Type ID is required', required: true })
  @IsNotEmpty({ message: 'Vendor Type ID is required' })
  @IsString()
  vendorTypeId: string;

  @ApiProperty({
    format: 'binary',
    required: false,
    type: 'string',
  })
  serviceOptImage?: Express.Multer.File;
}
