import { Banner } from '@prisma/client';

export function calculateBestPriceForItem({
  totalAmount,
  discountedAmount,
  bannerDiscountedAmount,
  banner,
}: {
  totalAmount: number;
  discountedAmount?: number;
  bannerDiscountedAmount?: number;
  banner?: Banner | null;
}) {
  const basePrice = discountedAmount ?? totalAmount;
  let finalPrice = basePrice;
  let bannerApplied = false;

  if (banner && bannerDiscountedAmount && bannerDiscountedAmount < finalPrice) {
    finalPrice = bannerDiscountedAmount;
    bannerApplied = true;
  }

  return { bestPrice: finalPrice, bannerApplied };
}
