import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePosterDto {
  @IsString()
  @IsNotEmpty({ message: 'heading is required' })
  @IsOptional()
  heading?: string;

  @ApiProperty({
    description: 'Whether the user is a donor',
    enum: Status,
    required: false,
  })
  @IsEnum(Status, {
    message: `isDonor must be either '${Status.ACTIVE}' or '${Status.INACTIVE}'`,
  })
  @IsOptional()
  status?: Status;
}
