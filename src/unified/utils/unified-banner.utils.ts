import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

/*----- utils: fetch paginated active store banners for a vendor -----*/
export async function fetchPaginatedStoreBanners({
  vendorId,
  offset,
  limit,
  prisma,
}: {
  vendorId: string;
  offset: number;
  limit: number;
  prisma: PrismaService;
}) {
  const now = new Date();
  const where: Prisma.BannerWhereInput = {
    vendorId,
    status: 'ACTIVE',
    startDateTime: { lte: now },
    endDateTime: { gte: now },
  };

  return await prisma.banner.findMany({
    where,
    skip: offset,
    take: limit,
    include: {
      bannerItemImages: {
        select: {
          id: true,
          imageRef: true,
          relativeUrl: true,
        },
      },
      productUnit: {
        select: {
          id: true,
          name: true,
        },
      },
      keyWordBanner: {
        select: {
          id: true,
          keyWord: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/*----- utils: fetch total active banners count -----*/
export async function fetchStoreBannersCount({
  vendorId,
  prisma,
}: {
  vendorId: string;
  prisma: PrismaService;
}): Promise<number> {
  const now = new Date();
  const where: Prisma.BannerWhereInput = {
    vendorId,
    status: 'ACTIVE',
    startDateTime: { lte: now },
    endDateTime: { gte: now },
  };

  return await prisma.banner.count({ where });
}
