// dto/get-privacy-policy.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetPrivacyPolicyQueryDto {
  @ApiProperty({
    description: 'Filter by user type',
    enum: UserType,
    required: false,
    example: UserType.VENDOR,
  })
  @IsOptional()
  @IsEnum(UserType, {
    message: `userType must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  userType?: UserType;

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
