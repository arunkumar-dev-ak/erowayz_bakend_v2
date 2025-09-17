import { ApiProperty } from '@nestjs/swagger';
import { LicenseType, PaymentMethod, ShopType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsUniqueArrayConstraint implements ValidatorConstraintInterface {
  validate(array: any[]) {
    if (!Array.isArray(array)) return false;
    return new Set(array).size === array.length;
  }

  defaultMessage() {
    return 'Each value in the array must be unique';
  }
}

export class TestRegisterVendorDto {
  @ApiProperty({
    description: 'Mobile must be exactly 10 digits',
    required: true,
  })
  @Matches(/^\d{10}$/, { message: 'Mobile must be exactly 10 digits' })
  @IsNotEmpty({ message: 'Mobile is required' })
  mobile: string;

  @ApiProperty({ description: 'Name is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  shopImageRef: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  vendorImageRef: Express.Multer.File;

  @ApiProperty({ description: 'VendorTypeId is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'vendorTypeId is required' })
  vendorTypeId: string;

  @ApiProperty({ description: 'ShopName is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'shopName is required' })
  shopName: string;

  @ApiProperty({ description: 'Address is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({ description: 'City is required', required: true })
  @IsString()
  @IsNotEmpty({ message: 'city is required' })
  city: string;

  @ApiProperty({
    description: 'Pincode must contain exactly 6 digits',
    required: true,
  })
  @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
  @IsNotEmpty({ message: 'pincode is required' })
  pincode: string;

  @ApiProperty({ description: 'FCM Token', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'FCM Token must not be empty, if defined' })
  @Matches(/^[a-zA-Z0-9\-_:]+$/, {
    message: 'Invalid FCM token format',
  })
  fcmToken?: string;

  @ApiProperty({ description: 'Email is required', required: true })
  @IsEmail()
  @IsNotEmpty({ message: 'email is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  email: string;

  @ApiProperty({
    description: 'Latitude must be between -90 and 90',
    required: true,
  })
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsLatitude({ message: 'Latitude must be between -90 and 90' })
  @IsNotEmpty({ message: 'Latitude is required' })
  latitude: number;

  @ApiProperty({
    description: 'Longitude must be between -180 and 180',
    required: true,
  })
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsLongitude({ message: 'Longitude must be between -180 and 180' })
  @IsNotEmpty({ message: 'Longitude is required' })
  longitude: number;

  @ApiProperty({
    description: 'Payment methods for the shop info',
    enum: PaymentMethod,
    isArray: true,
    example: [PaymentMethod.CASH, PaymentMethod.JUSPAY],
    required: true,
  })
  @IsArray()
  @IsEnum(PaymentMethod, {
    each: true,
    message: `Each payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  @Validate(IsUniqueArrayConstraint)
  paymentMethod: PaymentMethod[];

  @ApiProperty({
    description: 'ShopTypes for the shop info',
    enum: ShopType,
    example: ShopType.CART,
    required: true,
  })
  @IsEnum(ShopType, {
    each: true,
    message: `Each Shop Type must be one of: ${Object.values(ShopType).join(', ')}`,
  })
  @IsOptional()
  shopType?: ShopType;

  @ApiProperty({
    type: 'array',
    description: 'Service Options Ids array must have atleast 1 ids',
    required: true,
  })
  @IsOptional()
  @IsArray({ message: 'Service Options must be in an array format' })
  @IsNotEmpty({ message: 'Service Options are required' })
  @IsString({ each: true, message: 'Each Service Option ID must be a string' })
  @Validate(IsUniqueArrayConstraint)
  serviceOptionIds: string[];

  @ApiProperty({
    type: 'array',
    description: 'KeyWord Ids array must have atleast 1 ids',
    required: true,
  })
  @IsOptional()
  @IsArray({ message: 'KeyWord must be in an array format' })
  @IsNotEmpty({ message: 'KeyWord are required' })
  @IsString({ each: true, message: 'Each KeyWord ID must be a string' })
  @Validate(IsUniqueArrayConstraint)
  keyWordIds?: string[];

  @ApiProperty({ description: 'License number', example: 'ABCDEFGHIJKLMN' })
  @IsNotEmpty({ message: 'License Number must not be empty, if defined' })
  @IsString()
  licenseNo: string;

  @ApiProperty({
    description: 'License Type as ',
    enum: LicenseType,
    isArray: true,
    example: LicenseType.FISSAI,
    required: true,
  })
  @IsEnum(LicenseType, {
    each: true,
    message: `Each LicenseType must be one of: ${Object.values(LicenseType).join(', ')}`,
  })
  licenseType: LicenseType;

  @ApiProperty({ description: 'nameTamil is required', required: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'nameTamil is required' })
  nameTamil?: string;

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
  @ValidateIf((obj: TestRegisterVendorDto) => obj.licenseNo !== undefined)
  @IsNotEmpty({
    message: 'Expiry date is required if license number is provided',
  })
  @IsDateString({}, { message: 'Expiry date must be a valid ISO date string' })
  expiryDate?: string;
}
