import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { OfferType } from '@prisma/client';

export class UpdatePredefinedBannerDto {
  @ApiProperty({
    description: 'Name of the predefined banner, if defined',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty if defined' })
  name?: string;

  @ApiProperty({
    description: 'Description of the predefined banner, if defined',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Description cannot be empty if defined' })
  description?: string;

  @ApiProperty({
    description: 'Title of the predefined banner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title?: string;

  @ApiProperty({
    description: 'SubHeading of the predefined banner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'SubHeading is required' })
  subHeading?: string;

  @ApiProperty({
    description: 'Background color in hex format (e.g., #FFFFFF), if defined',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Background color cannot be empty if defined' })
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Invalid hex color code',
  })
  bgColor?: string;

  @ApiProperty({
    description: 'Text color in hex format (e.g., #000000), if defined',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Text color cannot be empty if defined' })
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Invalid hex color code',
  })
  textColor?: string;

  @ApiProperty({
    description: 'Offer type (FLAT or PERCENTAGE), if defined',
    required: false,
    enum: OfferType,
  })
  @IsEnum(OfferType, { message: 'OfferType should be FLAT or PERCENTAGE' })
  @IsOptional()
  @IsNotEmpty({ message: 'Offer type cannot be empty if defined' })
  offerType?: OfferType;

  @ApiProperty({ description: 'Offer value, if defined', required: false })
  @IsInt({ message: 'Offer value must be an integer' })
  @IsOptional()
  @IsNotEmpty({ message: 'Offer value cannot be empty if defined' })
  offerValue?: number;

  @ApiProperty({
    description: 'Minimum apply value, if defined',
    required: false,
  })
  @IsInt({ message: 'Minimum apply value must be an integer' })
  @IsOptional()
  @IsNotEmpty({ message: 'Minimum apply value cannot be empty if defined' })
  minApplyValue?: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  fgImage?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  bgImage?: Express.Multer.File;
}
