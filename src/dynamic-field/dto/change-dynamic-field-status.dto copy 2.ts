import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ChangeDynamicFieldStatusDto {
  @ApiProperty({
    description: 'Status of the dynamic field',
    enum: Status,
    example: Status.ACTIVE,
    required: true,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  status: Status;
}
