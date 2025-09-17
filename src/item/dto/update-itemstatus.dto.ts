import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateItemStatus {
  @ApiProperty({
    description: 'Status is either ACTIVE or INACTIVE',
    required: true,
    enum: Status,
  })
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsEnum(Status)
  status: Status;
}
