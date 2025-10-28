import { BadRequestException } from '@nestjs/common';
import { UpdatePlatformFeeDto } from '../dto/update-platform-fee.dto';
import { PlatformFeeService } from '../platform-fee.service';
import { Prisma } from '@prisma/client';

export const UpdatePlatformFeeUtils = async ({
  body,
  platformFeeService,
  platformFeeId,
}: {
  body: UpdatePlatformFeeDto;
  platformFeeService: PlatformFeeService;
  platformFeeId: string;
}) => {
  const { startAmount, endAmount, fee } = body;

  const existingPlatformFee =
    await platformFeeService.checkPlatformfeeById(platformFeeId);
  if (!existingPlatformFee) {
    throw new BadRequestException('Platform fee not found');
  }

  if (startAmount || endAmount) {
    const finalStartAmount = startAmount ?? existingPlatformFee.startAmount;
    const finalEndAmount = endAmount ?? existingPlatformFee.endAmount;

    if (finalStartAmount >= finalEndAmount) {
      throw new BadRequestException(
        'Start Amount must be less than the End amount',
      );
    }

    const existingPlatformRange = await platformFeeService.checkFeeByRange({
      startAmount: finalStartAmount,
      endAmount: finalEndAmount,
      id: existingPlatformFee.id,
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
  }

  const updateQuery: Prisma.PlatformFeesUpdateInput = {};

  if (startAmount !== undefined) {
    updateQuery.startAmount = startAmount;
  }

  if (endAmount !== undefined) {
    updateQuery.endAmount = endAmount;
  }

  if (fee !== undefined) {
    updateQuery.fee = fee;
  }

  return { updateQuery };
};
