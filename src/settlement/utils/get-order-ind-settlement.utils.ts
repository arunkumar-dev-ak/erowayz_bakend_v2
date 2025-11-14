import { OrderPaymentStatus, OrderPaymentType, Prisma } from '@prisma/client';
import { GetAdminIndividulaSettlementQueryDto } from '../dto/admin-order-ind-settlement';
import { getDayRange } from 'src/common/functions/utils';

export function getAdminIndividualSettlements({
  query,
}: {
  query: GetAdminIndividulaSettlementQueryDto;
}) {
  const { date, vendorId } = query;

  // Get start/end of the day in UTC
  const { start, end } = getDayRange(date);

  console.log(start, end);

  // Shift to IST (UTC+5:30)
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins in ms
  const startIst = new Date(start.getTime() - IST_OFFSET_MS);
  const endIst = new Date(end.getTime() - IST_OFFSET_MS);

  console.log(IST_OFFSET_MS, startIst, endIst);

  const where: Prisma.OrderPaymentWhereInput = {
    type: OrderPaymentType.JUSPAY,
    status: OrderPaymentStatus.COMPLETED,
    createdAt: {
      gte: startIst,
      lte: endIst,
    },
    order: {
      orderItems: {
        some: {
          orderItemVendorServiceOption: {
            some: {
              vendorServiceOption: {
                vendorId,
              },
            },
          },
        },
      },
    },
  };

  return { where };
}
