import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApprovedOrPendingStatus } from 'src/vendor/dto/get-vendor-admin-query.dto';

export class UpdateLicenseInfo {
  @ApiProperty({ description: 'LicenseId is required' })
  @IsNotEmpty()
  @IsString()
  licenseId: string;

  @ApiProperty({
    description: 'Filter by Shop name',
    type: String,
  })
  @IsEnum(ApprovedOrPendingStatus, {
    message: `licenseStatus must be either '${ApprovedOrPendingStatus.APPROVED}' or '${ApprovedOrPendingStatus.PENDING}'`,
  })
  isLicenseApproved: ApprovedOrPendingStatus;
}
