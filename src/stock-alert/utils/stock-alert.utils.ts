import { Prisma, ProductStatus, Status } from '@prisma/client';
import { StockAlertFilter } from '../dto/get-stock-alerts-query.dto';

export const STOCK_ALERT_PUBSUB_CHANNEL = 'stock-alerts:updates';

export const STOCK_ALERT_ITEM_SELECT = {
  id: true,
  name: true,
  nameTamil: true,
  remainingQty: true,
  dailyTotalQty: true,
  productUnitId: true,
  productstatus: true,
  updatedAt: true,
  itemImage: {
    take: 1,
    select: {
      id: true,
      absoluteUrl: true,
      relativeUrl: true,
    },
  },
} satisfies Prisma.ItemSelect;

export type StockAlertItemRecord = Prisma.ItemGetPayload<{
  select: typeof STOCK_ALERT_ITEM_SELECT;
}>;

/**
 * Reads threshold (< 5 default) and WebSocket stack limit (3 default) from .env.
 */
export function getStockAlertConfig(): {
  threshold: number;
  stackLimit: number;
} {
  const parsedThreshold = Number(process.env.STOCK_ALERT_LOW_THRESHOLD);
  const threshold =
    Number.isFinite(parsedThreshold) && parsedThreshold > 0
      ? parsedThreshold
      : 5;

  const parsedStackLimit = Number(process.env.STOCK_ALERT_STACK_LIMIT);
  const stackLimit =
    Number.isFinite(parsedStackLimit) && parsedStackLimit > 0
      ? parsedStackLimit
      : 3;

  return { threshold, stackLimit };
}

/**
 * Builds Prisma where filter for active items with stock below threshold or out of stock.
 */
export function buildStockAlertWhereFilter({
  vendorId,
  threshold,
  filter = StockAlertFilter.ALL,
  search,
}: {
  vendorId: string;
  threshold: number;
  filter?: StockAlertFilter;
  search?: string;
}): Prisma.ItemWhereInput {
  const andConditions: Prisma.ItemWhereInput[] = [
    { vendorId },
    { status: Status.ACTIVE },
  ];

  if (filter === StockAlertFilter.OUT_OF_STOCK) {
    andConditions.push({
      OR: [
        { remainingQty: { lte: 0 } },
        { productstatus: ProductStatus.OUT_OF_STOCK },
      ],
    });
  } else if (filter === StockAlertFilter.LOW_STOCK) {
    andConditions.push({
      remainingQty: { gt: 0, lt: threshold },
      productstatus: { not: ProductStatus.OUT_OF_STOCK },
    });
  } else {
    andConditions.push({
      OR: [
        { remainingQty: { lt: threshold } },
        { productstatus: ProductStatus.OUT_OF_STOCK },
      ],
    });
  }

  if (search && search.trim().length > 0) {
    const trimmed = search.trim();
    andConditions.push({
      OR: [
        { name: { contains: trimmed, mode: 'insensitive' } },
        { nameTamil: { contains: trimmed, mode: 'insensitive' } },
      ],
    });
  }

  return { AND: andConditions };
}

/**
 * Enriches an Item record with alert severity and display label.
 */
export function formatStockAlertItem(
  item: StockAlertItemRecord,
  threshold: number,
) {
  const isOutOfStock =
    item.remainingQty <= 0 || item.productstatus === ProductStatus.OUT_OF_STOCK;

  return {
    ...item,
    severity: isOutOfStock ? ('OUT_OF_STOCK' as const) : ('LOW_STOCK' as const),
    alertLabel: isOutOfStock
      ? 'OUT OF STOCK'
      : `Only ${item.remainingQty} left (< ${threshold})`,
  };
}
