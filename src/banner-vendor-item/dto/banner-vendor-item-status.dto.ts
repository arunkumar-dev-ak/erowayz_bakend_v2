import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class BannerVendorItemStatusDto {
  @ApiProperty({
    description: 'Product availability status',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsEnum(Status, {
    message: `Invalid  Status. Must be one of ${Object.values(Status).join(', ')} values`,
  })
  status: Status;
}
