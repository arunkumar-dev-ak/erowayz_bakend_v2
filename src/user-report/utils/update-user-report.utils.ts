import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserReportDto } from '../dto/update-user-report.dto';
import { UserReportService } from '../user-report.service';
import { Prisma } from '@prisma/client';

export const UpdateUserReportUtils = async ({
  body,
  userReportService,
  userId,
  userReportId,
}: {
  body: UpdateUserReportDto;
  userReportService: UserReportService;
  userId: string;
  userReportId: string;
}) => {
  const { report } = body;

  if (!report || report.trim() === '') {
    throw new BadRequestException('Report is required for update');
  }

  // Fetch the existing report
  const userReport = await userReportService.getUserReportById({
    id: userReportId,
  });

  if (!userReport) {
    throw new NotFoundException('User report not found');
  }

  // Ensure the report belongs to the same user
  if (userReport.userId !== userId) {
    throw new ForbiddenException(
      'You are not authorized to update this report',
    );
  }

  // Check status must be "Pending" to allow updates
  if (userReport.status !== 'PENDING') {
    throw new BadRequestException('Only pending reports can be updated');
  }

  // Update the report
  const updateQuery: Prisma.UserReportUpdateInput = {
    report,
  };

  return { updateQuery };
};
