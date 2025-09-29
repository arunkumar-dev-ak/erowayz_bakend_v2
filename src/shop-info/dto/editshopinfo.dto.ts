import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

export class EditShopInfo {
  @ApiProperty({ description: 'Vendor Type ID is optional' })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiProperty({ description: 'Address is optional' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'IsTermsAccepted must be either true or false' })
  @IsOptional()
  @IsBoolean({ message: 'IsTermsAccepted must be either true or false' })
  istermsAccepted?: boolean;

  @ApiProperty({ description: 'shopCity is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'shopCity is required' })
  @IsOptional()
  shopCityId?: string;

  @ApiProperty({ description: 'Pincode must be exactly 6 digits' })
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
  pincode?: string;

  @ApiProperty({ description: 'Latitude must be between -90 and 90' })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsLatitude({ message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiProperty({ description: 'Longitude must be between -180 and 180' })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsLongitude({ message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  @IsOptional()
  @ApiProperty({ description: 'License number', example: 'ABCDEFGHIJKLMN' })
  @IsNotEmpty({ message: 'License Number must not be empty, if defined' })
  @IsString()
  @Length(40, 40, { message: 'License Number must be exactly 14 characters' })
  licenseNo?: string;

  @ApiProperty({ description: 'License Category ID is optional' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: `License Category id is required` })
  licenseCategoryId?: string;

  @ApiProperty({ description: 'ShopCategoryId is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'ShopCategoryId is required' })
  @IsOptional()
  shopCategoryId: string;

  @ApiProperty({ description: 'shopNameTamil is required', required: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'shopNameTamil is required' })
  shopNameTamil?: string;

  @ApiProperty({ description: 'addressTamil is required', required: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'addressTamil is required' })
  addressTamil?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Expiry date (Required if licenseNumber is provided)',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsNotEmpty({
    message: 'Expiry date is required if license number is provided',
  })
  @ValidateIf((obj: EditShopInfo) => obj.licenseNo !== undefined)
  @IsDateString({}, { message: 'Expiry date must be a valid ISO date string' })
  expiryDate?: string;
}
