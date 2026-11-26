import { ApiProperty } from '@nestjs/swagger';
import { CustomerReportStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export const ADMIN_REPORT_ACTION_STATUSES: CustomerReportStatus[] = [
  CustomerReportStatus.VIEWED,
  CustomerReportStatus.ACCEPTED,
  CustomerReportStatus.DECLINED,
  CustomerReportStatus.RESOLVED,
];

export class UpdateCustomerReportStatusDto {
  @ApiProperty({
    description: 'Admin resolution status update',
    enum: ADMIN_REPORT_ACTION_STATUSES,
    example: CustomerReportStatus.RESOLVED,
  })
  @IsIn(ADMIN_REPORT_ACTION_STATUSES, {
    message: `Status must be one of: ${ADMIN_REPORT_ACTION_STATUSES.join(', ')}`,
  })
  status: CustomerReportStatus;
}
