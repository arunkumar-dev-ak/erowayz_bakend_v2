import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVideoLinkDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'heading is required' })
  heading: string;

  @ApiProperty({ description: 'Name is required', required: true })
  @IsNotEmpty()
  @IsString()
  tamilHeading: string;

  @ApiProperty({
    description: 'VendorTypeId should not be empty',
    required: true,
    example: 'Your vendorTypeId here',
  })
  @IsString()
  @IsNotEmpty({ message: 'VendorTypeId should not be empty' })
  vendorTypeId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Link is required' })
  link: string;

  @ApiProperty({
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;
}
