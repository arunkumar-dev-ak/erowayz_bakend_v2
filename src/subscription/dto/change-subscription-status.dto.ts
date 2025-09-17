import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ChangeSubScriptionStatus {
  @ApiProperty({
    description: 'Status of the subscription plan',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
    default: Status.INACTIVE,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  status?: Status;
}
