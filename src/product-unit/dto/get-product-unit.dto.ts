import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetProductUnitQueryDto {
  @ApiPropertyOptional({
    description: 'Filter License Category by name',
    type: String,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: `Status must be one of the following: ${Object.values(Status).join(', ')}`,
  })
  status?: Status;

  @ApiPropertyOptional({
    description: 'Number of records to skip (for pagination), default is 0',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional({
    description: 'Number of records to return (for pagination), default is 10',
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  limit?: string = '10';
}
