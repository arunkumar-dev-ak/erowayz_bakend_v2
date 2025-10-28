import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserReportStatusType } from '@prisma/client';

export class UpdateUserReportStatusDto {
  @ApiProperty({
    example: UserReportStatusType.RESOLVED,
    description: 'Status of the user report',
    enum: UserReportStatusType,
  })
  @IsNotEmpty({ message: 'status is required' })
  @IsEnum(UserReportStatusType, {
    message: 'Invalid status. Must be one of PENDING, IN_PROGRESS, or RESOLVED',
  })
  status: UserReportStatusType;
}
