import { ApiProperty } from '@nestjs/swagger';
import { BannerStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeStatusPredefinedBannerDto {
  @ApiProperty({
    description: 'Banner status should be like ACTIVE or INACTIVE',
    required: false,
    enum: BannerStatus,
  })
  @IsEnum(BannerStatus, {
    message: 'Banner status should be like ACTIVE or INACTIVE',
  })
  status: BannerStatus;
}
