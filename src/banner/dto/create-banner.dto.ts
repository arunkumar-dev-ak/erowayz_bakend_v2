import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BannerStatus, fgBannerImagePosition, OfferType } from '@prisma/client';
import { extractMilliSecond } from 'src/common/functions/extract_millisecond';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

// Custom validator for dynamic max validation
@ValidatorConstraint({ name: 'offerValueValidation', async: false })
export class OfferValueConstraint implements ValidatorConstraintInterface {
  validate(offerValue: number, args: ValidationArguments) {
    const obj = args.object as CreateBannerDto;
    if (obj.offerType === OfferType.PERCENTAGE) {
      return offerValue < 100;
    }
    if (obj.offerType === OfferType.FLAT) {
      return obj.minApplyValue ? offerValue < obj.minApplyValue : false;
    }
    return true;
  }

  defaultMessage() {
    return `Offer value must be less than 100 for PERCENTAGE, and less than Minimum Purchase Amount for FLAT.`;
  }
}

//validation for starttime
@ValidatorConstraint({ name: 'MinutesAhead', async: false })
export class MinutesAheadConstraint implements ValidatorConstraintInterface {
  private timeDescription: string = 'some time';

  validate(startDateTime: Date) {
    const now = new Date();
    const extractedTime = extractMilliSecond(
      process.env.BANNER_CREATION_AHEAD_TIME || '1m',
    );

    this.timeDescription = extractedTime.time;

    const minAllowedDate = new Date(now.getTime() + extractedTime.milliseconds);
    return startDateTime > minAllowedDate;
  }

  defaultMessage() {
    return `Start date and time must be at least ${this.timeDescription} ahead of the current time`;
  }
}

//validation for endTime
@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
export class EndDateAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(endDateTime: Date, args: ValidationArguments) {
    const obj = args.object as CreateBannerDto;
    return obj.startDateTime ? endDateTime > obj.startDateTime : false;
  }

  defaultMessage() {
    return 'End date and time must be greater than the start date and time.';
  }
}

export class CreateBannerDto {
  @ApiProperty({
    description: 'Name of the predefined banner',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'nameTamil is required' })
  @IsOptional()
  nameTamil?: string;

  @ApiProperty({
    description: 'Title of the predefined banner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'nameTamil is required' })
  @IsOptional()
  titleTamil?: string;

  @ApiProperty({
    description: 'SubTitle of the predefined banner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'SubTitle is required' })
  subTitle?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'nameTamil is required' })
  @IsOptional()
  subTitleTamil?: string;

  @ApiProperty({
    description: 'SubHeading of the predefined banner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'SubHeading is required' })
  subHeading?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'subHeading is required' })
  @IsOptional()
  subHeadingTamil?: string;

  @ApiProperty({
    description: 'Description of the predefined banner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'descriptionTamil is required' })
  @IsOptional()
  descriptionTamil?: string;

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

  //Regulaer Banner fields
  @ApiProperty({
    description: ' quantity available',
    required: true,
    example: 1.5,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: ' qty must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: ' qty must be greater than zero' })
  @IsNotEmpty({ message: ' qty should not be empty' })
  qty?: number;

  @ApiProperty({
    description: 'ProductUnitId should not be empty',
    required: true,
    example: 'Your ProductUnitId here',
  })
  @IsString()
  @IsNotEmpty({ message: 'ProductUnitId should not be empty' })
  productUnitId: string;

  @ApiProperty({
    description:
      'Price should be greater than zero and have exactly 2 decimal places',
    required: true,
    example: 25.22,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @Min(1.0, { message: 'Price must be greater than zero' })
  @IsNotEmpty({ message: 'Price should not be empty' })
  originalPricePerUnit?: number;

  @ApiProperty({ description: 'Offer type', required: true, enum: OfferType })
  @IsEnum(OfferType, {
    message: 'OfferType should be of type FLAT or PERCENTAGE',
  })
  @IsNotEmpty({ message: 'Offer type is required' })
  offerType: OfferType;

  @ApiProperty({ description: 'Offer value', required: true })
  @IsInt()
  @IsNotEmpty({ message: 'Offer value is required' })
  @Validate(OfferValueConstraint)
  offerValue: number;

  @ApiProperty({ description: 'Minimum apply value', required: true })
  @IsInt()
  @IsNotEmpty({ message: 'Minimum apply value is required' })
  minApplyValue: number;

  @ApiProperty({
    description: 'Start date and time of the banner',
    example: '2024-09-01T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  @Validate(MinutesAheadConstraint)
  startDateTime: Date;

  @ApiProperty({
    description: 'End date and time of the banner',
    example: '2024-09-30T23:59:59.000Z',
    required: true,
  })
  @IsDate()
  @Validate(EndDateAfterStartDateConstraint)
  endDateTime: Date;

  @ApiProperty({
    description: 'Status of the banner',
    enum: BannerStatus,
    example: BannerStatus.ACTIVE,
    required: true,
  })
  @IsEnum(BannerStatus, {
    message: 'Banner Status is either ACTIVE or INACTIVE',
  })
  status: BannerStatus;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  fgImage?: Express.Multer.File;

  @ApiProperty({
    description: 'fgImagePosition of the banner',
    enum: fgBannerImagePosition,
    example: fgBannerImagePosition.LEFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(fgBannerImagePosition, {
    message: 'fgImagePosition is either LEFT or RIGHT',
  })
  fgImagePosition?: fgBannerImagePosition;

  @ApiProperty({
    type: 'array',
    description: 'KeyWord Ids array must have atleast 1 ids',
    required: true,
  })
  @ArrayMinSize(1, { message: 'At least 1 keyword IDs are required' })
  @IsArray({ message: 'KeyWord must be in an array format' })
  @IsNotEmpty({ message: 'KeyWord are required' })
  @IsString({ each: true, message: 'Each KeyWord ID must be a string' })
  @Validate(IsUniqueArrayConstraint)
  keyWordIds: string[];

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  bgImage?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  itemImages?: Express.Multer.File[];
}
