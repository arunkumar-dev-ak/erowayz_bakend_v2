import { ApiProperty } from '@nestjs/swagger';
import {
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
import {
  BannerStatus,
  fgBannerImagePosition,
  OfferType,
  QuantityUnit,
} from '@prisma/client';
import { extractMilliSecond } from 'src/common/functions/extract_millisecond';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

@ValidatorConstraint({ name: 'OfferValueValidator', async: false })
export class OfferValueValidator implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const dto = args.object as UpdateBannerDto;
    if (dto.offerType === OfferType.PERCENTAGE) {
      return value < 100;
    } else if (dto.offerType === OfferType.FLAT) {
      return dto.minApplyValue ? value < dto.minApplyValue : true;
    }
    return true;
  }

  defaultMessage() {
    return `Offer value must be less than 100 for PERCENTAGE, and less than Minimum Purchase Amount for FLAT.`;
  }
}

@ValidatorConstraint({ name: 'MinutesAhead', async: false })
export class MinutesAheadConstraint implements ValidatorConstraintInterface {
  private timeDescription: string = 'some time';

  validate(startDateTime: Date) {
    const now = new Date();
    const extractedTime = extractMilliSecond(
      process.env.BANNER_UPDATION_AHEAD_TIME || '1m',
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
    const obj = args.object as UpdateBannerDto;
    return obj.startDateTime
      ? endDateTime > obj.startDateTime
        ? true
        : false
      : true;
  }

  defaultMessage() {
    return 'End date and time must be greater than the start date and time.';
  }
}

export class UpdateBannerDto {
  @ApiProperty({
    description: 'Name of the predefined banner',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name is required, if defined' })
  name?: string;

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
  @IsNotEmpty({ message: 'Description is required, if defined' })
  description?: string;

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
    description: 'QuantityUnit should be one of the predefined values',
    required: true,
    enum: QuantityUnit,
  })
  @IsOptional()
  @IsEnum(QuantityUnit, {
    message:
      'Invalid Quantity Unit. Must be one of: GENERAL, KG, GRAM, BOX, SET, PIECE, LITRE, MILLILITRE, UNIT, SERVE.',
  })
  qtyUnit?: QuantityUnit;

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

  @ApiProperty({
    description: 'Background color in hex format (e.g., #FFFFFF)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Invalid hex color code',
  })
  bgColor?: string;

  @ApiProperty({
    description: 'Text color in hex format (e.g., #000000)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Invalid hex color code',
  })
  textColor?: string;

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

  @ApiProperty({ description: 'Offer type', required: false, enum: OfferType })
  @IsOptional()
  @IsEnum(OfferType, {
    message: 'OfferType should be of type FLAT or PERCENTAGE',
  })
  @IsNotEmpty({ message: 'Offer type is required' })
  offerType?: OfferType;

  @ApiProperty({ description: 'Offer value', required: false })
  @IsOptional()
  @IsInt()
  @Validate(OfferValueValidator)
  @IsNotEmpty({ message: 'Offer value is required' })
  offerValue?: number;

  @ApiProperty({ description: 'Minimum apply value', required: false })
  @IsOptional()
  @IsInt()
  @IsNotEmpty({ message: 'Minimum apply value is required' })
  minApplyValue?: number;

  @ApiProperty({
    description: 'Start date and time of the banner',
    example: '2024-09-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Validate(MinutesAheadConstraint)
  startDateTime?: Date;

  @ApiProperty({
    description: 'End date and time of the banner',
    example: '2024-09-30T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Validate(EndDateAfterStartDateConstraint)
  endDateTime?: Date;

  @ApiProperty({
    description: 'Status of the banner',
    enum: BannerStatus,
    example: BannerStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(BannerStatus, {
    message: 'Banner Status is either ACTIVE or INACTIVE',
  })
  status?: BannerStatus;

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

  @ApiProperty({
    type: 'array',
    description: 'Deleted Foreground Image ImageId',
    required: false,
  })
  @IsOptional()
  @IsArray({
    message: 'Deleted Foreground Image ImageId must be in an array format',
  })
  @IsString({
    each: true,
    message: 'Each Deleted Foreground Image ImageId must be a string',
  })
  @Validate(IsUniqueArrayConstraint)
  deletedItemImageIds?: string[];

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  fgImage?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  bgImage?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  itemImages?: Express.Multer.File[];
}
