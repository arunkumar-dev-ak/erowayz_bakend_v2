import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBankNameDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'tamilName is required' })
  tamilName: string;

  @ApiProperty({
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;
}
