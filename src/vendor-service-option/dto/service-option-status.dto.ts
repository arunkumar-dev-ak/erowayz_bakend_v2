import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export const VendorServiceStatusBooleanMap = {
  LAUNCH: true,
  UNLAUNCH: false,
};

export enum VendorServiceStatus {
  Launch = 'LAUNCH',
  UnLaunch = 'UNLAUNCH',
}

export class ServiceOptionStatusDto {
  @ApiProperty({
    description: `VendorServiceStatus must be one of: ${Object.values(VendorServiceStatus).join(', ')}`,
    required: true,
  })
  @IsEnum(VendorServiceStatus, {
    message: `VendorServiceStatus must be one of: ${Object.values(VendorServiceStatus).join(', ')}`,
  })
  vendorServiceStatus: VendorServiceStatus;
}
