import { Prisma } from '@prisma/client';
import { GetBannerVendorItemQueryDto } from '../dto/get-banner-vendor-item-query.dto';

export function buildBannerVendorItemWhereFilter({
  query,
}: {
  query: GetBannerVendorItemQueryDto;
}): Prisma.BannerVendorItemWhereInput {
  const where: Prisma.BannerVendorItemWhereInput = {};

  const { bannerVendorItemId, name, productStatus, status, vendorId } = query;

  if (bannerVendorItemId) {
    where.id = bannerVendorItemId;
  }
  if (status) where.status = status;
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (productStatus) where.productstatus = productStatus;
  if (vendorId) where.vendorId = vendorId;

  return where;
}
