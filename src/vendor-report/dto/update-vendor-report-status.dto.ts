import { ApiProperty } from '@nestjs/swagger';
import { VendorReportStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export const ADMIN_VENDOR_REPORT_ACTION_STATUSES: VendorReportStatus[] = [
  VendorReportStatus.VIEWED,
  VendorReportStatus.ACCEPTED,
  VendorReportStatus.DECLINED,
  VendorReportStatus.RESOLVED,
];

export class UpdateVendorReportStatusDto {
  @ApiProperty({
    description: 'Admin resolution status update',
    enum: ADMIN_VENDOR_REPORT_ACTION_STATUSES,
    example: VendorReportStatus.RESOLVED,
  })
  @IsIn(ADMIN_VENDOR_REPORT_ACTION_STATUSES, {
    message: `Status must be one of: ${ADMIN_VENDOR_REPORT_ACTION_STATUSES.join(', ')}`,
  })
  status: VendorReportStatus;
}
