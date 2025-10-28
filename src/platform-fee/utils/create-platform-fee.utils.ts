import { BadRequestException } from '@nestjs/common';
import { CreatePlatformFeeDto } from '../dto/create-platform-fee.dto';
import { PlatformFeeService } from '../platform-fee.service';
import { Prisma } from '@prisma/client';

export const CreatePlatformUtilsUtils = async ({
  body,
  platformFeeService,
}: {
  body: CreatePlatformFeeDto;
  platformFeeService: PlatformFeeService;
}) => {
  const { startAmount, endAmount, fee } = body;

  if (startAmount >= endAmount) {
    throw new BadRequestException(
      'StartAmount must be greater than the endAmount',
    );
  }

  const existingPlatformRange = await platformFeeService.checkFeeByRange({
    startAmount,
    endAmount,
  });

  if (existingPlatformRange.length > 0) {
    // Get overlapping ranges for a clear message
    const overlappingRanges = existingPlatformRange
      .map((range) => `[${range.startAmount} - ${range.endAmount}]`)
      .join(', ');

    throw new BadRequestException(
      `Platform fee range overlaps with existing range(s): ${overlappingRanges}`,
    );
  }

  const createQuery: Prisma.PlatformFeesCreateInput = {
    startAmount,
    endAmount,
    fee,
  };

  return { createQuery };
};
