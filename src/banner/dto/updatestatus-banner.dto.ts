import { ApiProperty } from '@nestjs/swagger';
import { BannerStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateBannerStatusDto {
  @ApiProperty({
    description: 'Status is either ACTIVE or INACTIVE',
    required: false,
  })
  @IsEnum(BannerStatus, {
    message: 'Banner Status is either ACTIVE or INACTIVE',
  })
  @IsNotEmpty({ message: 'Status is ACTIVE or INACTIVE' })
  status: BannerStatus;
}
