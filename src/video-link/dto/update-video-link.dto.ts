import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateVideoLinkDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  @IsOptional()
  heading?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Link is required' })
  @IsOptional()
  link?: string;

  @ApiProperty({
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;
}
