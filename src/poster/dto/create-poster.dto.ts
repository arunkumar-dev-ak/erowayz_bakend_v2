// dto/create-poster.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Status, UserType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreatePosterDto {
  @ApiProperty({
    description: 'Poster heading',
    example: 'Special Offer - 50% Off',
  })
  @IsString()
  @IsNotEmpty({ message: 'Heading is required' })
  heading: string;

  @ApiProperty({
    description: 'User type for poster',
    enum: UserType,
    example: UserType.VENDOR,
  })
  @IsEnum(UserType, {
    message: `userType must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  userType: UserType;

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
  status?: Status = Status.ACTIVE;
}
