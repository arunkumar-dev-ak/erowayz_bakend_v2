import { Prisma } from '@prisma/client';
import { getDayRange } from 'src/common/functions/utils';
import { OrderSettlementService } from '../order-settlement.service';
import { BadRequestException } from '@nestjs/common';
import { UpdateOrderSettlementDto } from '../dto/update-order-settlement';

export const UpdateOrderSettlementUtils = async ({
  body,
  orderSettlementId,
  orderSettlementService,
}: {
  body: UpdateOrderSettlementDto;
  orderSettlementId: string;
  orderSettlementService: OrderSettlementService;
}) => {
  const { date, amount, uploadedFileIds } = body;

  const orderSettlement =
    await orderSettlementService.findOrderSettlementById(orderSettlementId);
  if (!orderSettlement) {
    throw new BadRequestException('OrderSettlement Not found');
  }

  const updateQuery: Prisma.OrderSettlementUpdateInput = {};

  if (date) {
    const { start } = getDayRange(date);
    updateQuery.date = start;
  }

  if (amount) {
    updateQuery.amount = amount;
  }

  if (uploadedFileIds && uploadedFileIds.length > 0) {
    updateQuery.orderSettlementFile = {
      set: [],
      connect: uploadedFileIds.map((id) => ({ id })),
    };
  }

  return { updateQuery, orderSettlement };
};
