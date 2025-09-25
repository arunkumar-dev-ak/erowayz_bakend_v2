// dto/get-privacy-policy.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisclaimerType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetDisclaimerQueryDto {
  @ApiProperty({
    description: 'Filter by user type',
    enum: DisclaimerType,
    required: false,
    example: DisclaimerType.BANNER_BOOK,
  })
  @IsOptional()
  @IsEnum(DisclaimerType, {
    message: `userType must be either '${DisclaimerType.BANNER_BOOK}' or '${DisclaimerType.PRODUCT_ORDER}', ${DisclaimerType.SERVICE_BOOK}'`,
  })
  disclaimerType?: DisclaimerType;

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
  @IsNotEmpty({ message: 'Limit must not be empty' })
  limit?: string = '10';
}
