import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreatePosterDto {
  @IsString()
  @IsNotEmpty({ message: 'heading is required' })
  heading: string;

  @ApiProperty({
    description: 'Whether the user is a donor',
    enum: Status,
    required: false,
  })
  @IsEnum(Status, {
    message: `isDonor must be either '${Status.ACTIVE}' or '${Status.INACTIVE}'`,
  })
  status: Status;
}
