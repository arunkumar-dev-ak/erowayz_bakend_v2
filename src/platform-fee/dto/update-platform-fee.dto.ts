import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class UpdatePlatformFeeDto {
  @ApiProperty({
    example: 100,
    description: 'Starting amount for which this platform fee applies',
  })
  @IsNotEmpty({ message: 'startAmount is required' })
  @IsInt({ message: 'startAmount must be an integer' })
  @Min(0, { message: 'startAmount must be greater than or equal to 0' })
  @IsOptional()
  startAmount?: number;

  @ApiProperty({
    example: 500,
    description: 'Ending amount for which this platform fee applies',
  })
  @IsNotEmpty({ message: 'endAmount is required' })
  @IsInt({ message: 'endAmount must be an integer' })
  @Min(0, { message: 'endAmount must be greater than or equal to 0' })
  @IsOptional()
  endAmount?: number;

  @ApiProperty({
    example: 50,
    description: 'Platform fee amount charged between the range',
  })
  @IsNotEmpty({ message: 'fee is required' })
  @IsInt({ message: 'fee must be an integer' })
  @Min(0, { message: 'fee must be greater than or equal to 0' })
  @IsOptional()
  fee?: number;
}
