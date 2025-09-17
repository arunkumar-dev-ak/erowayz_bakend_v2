import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddItemBannerDto {
  @ApiProperty({
    description: 'Id of the banner',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'BannerId is required' })
  bannerId: string;

  @ApiProperty({
    description: 'Id of the item',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'ItemId is required' })
  itemId: string;
}
