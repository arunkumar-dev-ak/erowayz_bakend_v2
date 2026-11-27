import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class AddCartBannerDto {
  @ApiProperty({ description: 'ID of the banner' })
  @IsString()
  @IsNotEmpty()
  bannerId: string;

  @ApiProperty({
    description: 'Quantity of combo banners to add',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Vendor Service Option IDs (e.g. Dine-in, Takeaway)',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  vendorServiceOptionIds: string[];
}
