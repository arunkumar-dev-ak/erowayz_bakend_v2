// dto/get-poster.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsNumberString, IsOptional, IsString, IsEnum } from 'class-validator';

export class GetPosterLinkQueryDto {
  @ApiPropertyOptional({
    description: 'Filter Poster by heading',
    type: String,
  })
  @IsString()
  @IsOptional()
  heading?: string;

  @ApiProperty({
    description: 'Filter by vendor type ID',
    required: false,
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  vendorTypeId?: string;

  @ApiProperty({
    description: 'Filter by vendor type ID',
    required: false,
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  vendorTypeName?: string;

  @ApiPropertyOptional({
    description: 'Filter by user type',
    enum: UserType,
    example: UserType.VENDOR,
  })
  @IsOptional()
  @IsEnum(UserType, {
    message: `userType must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  userType?: UserType;

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
