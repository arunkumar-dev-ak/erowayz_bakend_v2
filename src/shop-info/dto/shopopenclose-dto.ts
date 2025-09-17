import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ShopStatus {
  OPEN = 'true',
  CLOSED = 'false',
}

export class ShopOpenCloseDto {
  @ApiProperty({ description: 'isShopOpen is either true or false' })
  @IsEnum(ShopStatus, { message: 'ShopStatus is either true or false' })
  isShopOpen: ShopStatus;
}
