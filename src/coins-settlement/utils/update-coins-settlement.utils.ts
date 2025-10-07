import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CoinsSettlementService } from '../coins-settlement.service';
import { UpdateCoinSettlementDto } from '../dto/update-coins-settlement';

export const UpdateCoinsSettlementUtils = async ({
  body,
  coinSettlementService,
  coinSettlementId,
}: {
  body: UpdateCoinSettlementDto;
  coinSettlementService: CoinsSettlementService;
  coinSettlementId: string;
}) => {
  const { amount, uploadedFileIds } = body;

  const [existingSettlement, validFilesCount] = await Promise.all([
    coinSettlementService.findCoinSettlementById(coinSettlementId),
    uploadedFileIds
      ? coinSettlementService.findUploadedIdsCount(uploadedFileIds)
      : null,
  ]);

  // ✅ Validate results
  if (!existingSettlement) {
    throw new BadRequestException(`Settlement not found`);
  }

  if (uploadedFileIds && validFilesCount !== uploadedFileIds.length) {
    throw new BadRequestException('Some of the Proof Images are invalid');
  }

  const updateQuery: Prisma.CoinsSettlementUpdateInput = {
    ...(amount && { amount }),
    ...(uploadedFileIds &&
      uploadedFileIds.length > 0 && {
        coinsSettlementFile: {
          connect: uploadedFileIds.map((id) => ({ id })),
        },
      }),
  };

  return { updateQuery };
};
