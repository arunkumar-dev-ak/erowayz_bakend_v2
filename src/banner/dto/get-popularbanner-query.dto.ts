import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetPopularBannerQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by keyword IDs',
    type: [String],
  })
  @IsOptional()
  @IsString({ message: 'keywordId must be a string' })
  @IsNotEmpty({ message: 'keywordIds must not be empty' })
  keywordId?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Pagination offset, defaults to 0',
    example: 0,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Offset must not be empty' })
  offset?: string = '0';

  @ApiPropertyOptional({
    type: Number,
    description: 'Pagination limit, defaults to 10',
    example: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Offset must not be empty' })
  limit?: string = '10';
}
