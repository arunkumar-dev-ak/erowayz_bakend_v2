import { ApiProperty } from '@nestjs/swagger';
import { KeyWordType, Status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class updateKeyWordDto {
  @ApiProperty({
    description: 'Name should not be empty',
    required: true,
    example: 'Two Wheeler',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name?: string;

  @ApiProperty({
    description: 'VendorTypeId should not be empty',
    required: true,
    example: 'Your vendorTypeId here',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'VendorTypeId should not be empty' })
  vendorTypeId?: string;

  @ApiProperty({
    description: 'KeyWordType of the banner',
    enum: KeyWordType,
    example: KeyWordType.BANNER,
    required: true,
  })
  @IsOptional()
  @IsEnum(KeyWordType, {
    message: `KeyWordType must be one of: ${Object.values(KeyWordType).join(', ')}`,
  })
  keyWordType?: KeyWordType;

  @ApiProperty({
    description: 'Status of the banner',
    enum: Status,
    example: Status.ACTIVE,
    required: true,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: ' Status is either ACTIVE or INACTIVE',
  })
  status?: Status;
}
