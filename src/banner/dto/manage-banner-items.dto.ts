import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BannerItemInputDto {
  @ApiProperty({ description: 'ID of the product Item' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    description: 'Quantity of this item in the combo',
    example: 1.0,
    default: 1.0,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class SetBannerItemsDto {
  @ApiProperty({
    description: 'Array of items and quantities included in the combo banner',
    type: [BannerItemInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerItemInputDto)
  items: BannerItemInputDto[];
}
