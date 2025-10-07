import { BadRequestException } from '@nestjs/common';
import { OrderSettlementService } from '../order-settlement.service';

export const DeleteOrderSettlementUtils = async ({
  orderSettlementId,
  orderSettlementService,
}: {
  orderSettlementId: string;
  orderSettlementService: OrderSettlementService;
}) => {
  const orderSettlement =
    await orderSettlementService.findOrderSettlementById(orderSettlementId);
  if (!orderSettlement) {
    throw new BadRequestException('OrderSettlement Not found');
  }

  return { orderSettlement };
};
