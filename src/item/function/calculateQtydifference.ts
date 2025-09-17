export function calculateQtyDifference({
  remainingQty,
  bodyDailyTotalQty,
  itemDailyTotalQty,
}: {
  remainingQty: number;
  bodyDailyTotalQty: number;
  itemDailyTotalQty: number;
}): number {
  const diff = bodyDailyTotalQty - itemDailyTotalQty;

  if (diff > 0) {
    // Increase remainingQty
    return remainingQty + diff;
  } else {
    // Decrease but never below zero
    return Math.max(0, remainingQty + diff);
  }
}
