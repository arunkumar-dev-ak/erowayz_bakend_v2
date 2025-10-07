import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateCoinSettlementDto } from '../dto/create-coins-settlement';
import { CoinsSettlementService } from '../coins-settlement.service';

export const CreateCoinsSettlementUtils = async ({
  body,
  coinSettlementService,
}: {
  body: CreateCoinSettlementDto;
  coinSettlementService: CoinsSettlementService;
}) => {
  const { walletTransactionId, amount, uploadedFileIds } = body;

  const [existingTransaction, validFilesCount] = await Promise.all([
    coinSettlementService.findWalletTransactionById(walletTransactionId),
    coinSettlementService.findUploadedIdsCount(uploadedFileIds),
  ]);

  // ✅ Validate results
  if (!existingTransaction) {
    throw new BadRequestException(`Transaction not found`);
  }

  if (validFilesCount !== uploadedFileIds.length) {
    throw new BadRequestException('Some of the Proof Images are invalid');
  }

  if (existingTransaction.coinsSettlement) {
    throw new BadRequestException(
      'Settlement already present for this transaction',
    );
  }

  const createQuery: Prisma.CoinsSettlementCreateInput = {
    amount,
    ...(uploadedFileIds.length > 0 && {
      coinsSettlementFile: {
        connect: uploadedFileIds.map((id) => ({ id })),
      },
    }),
    walletTransaction: {
      connect: {
        id: walletTransactionId,
      },
    },
  };

  return { createQuery };
};
