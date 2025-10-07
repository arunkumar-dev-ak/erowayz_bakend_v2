import { BadRequestException } from '@nestjs/common';
import { CoinsSettlementService } from '../coins-settlement.service';

export const DeleteCoinSettlementUtils = async ({
  coinSettlementId,
  coinSettlementService,
}: {
  coinSettlementId: string;
  coinSettlementService: CoinsSettlementService;
}) => {
  const coinSettlement =
    await coinSettlementService.findCoinSettlementById(coinSettlementId);
  if (!coinSettlement) {
    throw new BadRequestException('CoinsSettlement Not found');
  }

  return { coinSettlement };
};
