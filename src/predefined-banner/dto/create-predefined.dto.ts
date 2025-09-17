import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { OfferType } from '@prisma/client';

export class CreatePredefinedBannerDto {
  @ApiProperty({
    description: 'Name of the predefined banner',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Description of the predefined banner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
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
    description: 'Background color in hex format (e.g., #FFFFFF)',
    required: false,
  })
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Invalid hex color code',
  })
  bgColor: string;

  @ApiProperty({
    description: 'Text color in hex format (e.g., #000000)',
    required: false,
  })
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Invalid hex color code',
  })
  textColor: string;

  @ApiProperty({ description: 'Offer type', required: true, enum: OfferType })
  @IsEnum(OfferType, {
    message: 'OfferType should be of type FLAT or PERCENTAGE',
  })
  @IsNotEmpty({ message: 'Offer type is required' })
  offerType: OfferType;

  @ApiProperty({ description: 'Offer value', required: true })
  @IsInt()
  @IsNotEmpty({ message: 'Offer value is required' })
  offerValue: number;

  @ApiProperty({ description: 'Minimum apply value', required: true })
  @IsInt()
  @IsNotEmpty({ message: 'Minimum apply value is required' })
  minApplyValue: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  fgImage?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  bgImage?: Express.Multer.File;
}
