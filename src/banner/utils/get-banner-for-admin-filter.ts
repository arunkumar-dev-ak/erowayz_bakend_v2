import { BannerType, Prisma } from '@prisma/client';
import { GetBannerForAdminQueryDto } from '../dto/get-banner-for-admin.dto';

export function buildBannerForAdminWhereFilter({
  query,
  bannerType,
}: {
  query: GetBannerForAdminQueryDto;
  bannerType: BannerType;
}): Prisma.BannerWhereInput {
  const where: Prisma.BannerWhereInput = {
    bannerType:
      bannerType === 'PRODUCT' ? BannerType.PRODUCT : BannerType.REGULAR,
  };

  const { bannerName, shopName } = query;

  if (bannerName) {
    where.name = { contains: bannerName, mode: 'insensitive' };
  }

  if (shopName) {
    where.vendor = {
      shopInfo: {
        name: {
          contains: shopName,
          mode: 'insensitive',
        },
      },
    };
  }

  return where;
}
