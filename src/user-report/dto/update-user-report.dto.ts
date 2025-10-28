import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserReportDto {
  @ApiProperty({
    example: 'User reported an issue with the order delivery',
    description: 'Report details describing the issue',
  })
  @IsNotEmpty({ message: 'report is required' })
  @IsString({ message: 'report must be a string' })
  report?: string;
}
