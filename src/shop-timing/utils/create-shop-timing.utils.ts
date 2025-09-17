import { ShopInfoService } from 'src/shop-info/shop-info.service';
import { BadRequestException } from '@nestjs/common';

export async function createShopTimingUtils({
  shopInfoService,
  vendorId,
}: {
  shopInfoService: ShopInfoService;
  vendorId: string;
}) {
  const shopInfo = await shopInfoService.findShopByVendor(vendorId);

  if (!shopInfo) {
    throw new BadRequestException('ShopInfo not found');
  }

  return { shopInfo };
}

export function createdOpenAndCloseTime(timing: string) {
  const [hours, minutes] = timing.split(':').map(Number);
  return new Date(Date.UTC(1960, 0, 1, hours, minutes));
}
