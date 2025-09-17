import { OrderPaymentStatus, OrderPaymentType, Prisma } from '@prisma/client';
import { GetAdminIndividulaSettlementQueryDto } from '../dto/admin-order-ind-settlement';

export function getAdminIndividualSettlements({
  query,
}: {
  query: GetAdminIndividulaSettlementQueryDto;
}) {
  const { date, vendorId } = query;

  const hourWithMin = date.toString().split(' ');
  const [year, month, day] = hourWithMin[0].split('-').map(Number);

  // Create UTC start/end of day
  const startUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  // Shift UTC to IST (UTC+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const startIst = new Date(startUtc.getTime() + IST_OFFSET);
  const endIst = new Date(endUtc.getTime() + IST_OFFSET);

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
