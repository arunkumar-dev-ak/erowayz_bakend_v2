import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVideoLinkDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'heading is required' })
  heading: string;

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
