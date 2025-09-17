import { BadRequestException } from '@nestjs/common';
import { BloodDetailsService } from '../blood-details.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestBloodDetailDto } from '../dto/request-blood-details.dto';
import { checkDynamicFields } from 'src/common/functions/utils';

export async function RequestBloodDetailsVerification({
  bloodDetailService,
  currentUserId,
  bloodDetailId,
}: {
  bloodDetailService: BloodDetailsService;
  currentUserId: string;
  bloodDetailId: string;
}) {
  const initialDate = new Date();
  // Fetch donor blood detail
  const donorBloodDetail =
    await bloodDetailService.findBloodDetailById(bloodDetailId);
  if (!donorBloodDetail) {
    throw new BadRequestException('Donor Blood Details not found');
  }

  // Check if donor is active
  if (!donorBloodDetail.isDonor) {
    throw new BadRequestException(
      `${donorBloodDetail.User.name} is not currently a donor`,
    );
  }

  // Check for existing request within the last 2 days
  const lastBloodDetails = await bloodDetailService.findLastBloodDetails(
    currentUserId,
    donorBloodDetail.userId,
  );

  if (lastBloodDetails) {
    const lastRequestedDate = new Date(lastBloodDetails.createdAt);
    const timeDiffInSeconds =
      (initialDate.getTime() - lastRequestedDate.getTime()) / 1000;

    const restrictedSeconds = 2 * 24 * 60 * 60; // 2 days in seconds
    if (timeDiffInSeconds <= restrictedSeconds) {
      throw new BadRequestException(
        `You have already requested blood from bloodDetailService donor recently. Please wait at least 2 days before making another request.`,
      );
    }
  }

  return { donorBloodDetail };
}

export async function checkDynamicFieldForBloodRequest({
  prisma,
  body,
}: {
  prisma: PrismaService;
  body: RequestBloodDetailDto;
}) {
  const dynamicFields = await prisma.dynamicField.findMany({
    where: {
      context: 'BLOOD_REQUEST',
      status: 'ACTIVE',
    },
    include: {
      selectOptions: true,
    },
  });

  const inputFields = body.dynamicFields || {};

  checkDynamicFields({
    inputFields,
    dynamicFields,
  });

  return { inputFields };
}
