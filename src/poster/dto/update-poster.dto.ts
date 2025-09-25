// dto/update-poster.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Status, UserType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdatePosterDto {
  @ApiProperty({
    description: 'Poster heading',
    example: 'Updated Special Offer - 60% Off',
    required: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Heading is required' })
  @IsOptional()
  heading?: string;

  @ApiProperty({
    description: 'User type for poster',
    enum: UserType,
    example: UserType.VENDOR,
    required: false,
  })
  @IsEnum(UserType, {
    message: `userType must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  @IsOptional()
  userType?: UserType;

  @ApiProperty({
    description: 'Vendor type ID (required for VENDOR user type)',
    required: false,
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID(4, { message: 'vendorTypeId must be a valid UUID' })
  vendorTypeId?: string;

  @ApiProperty({
    description: 'Poster status',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
  })
  @IsEnum(Status, {
    message: `status must be either '${Status.ACTIVE}' or '${Status.INACTIVE}'`,
  })
  @IsOptional()
  status?: Status;
}
