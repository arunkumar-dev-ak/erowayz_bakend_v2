import { BadRequestException } from '@nestjs/common';
import { Banner, BannerStatus, BannerType, Prisma, Role } from '@prisma/client';
import { KeywordService } from 'src/keyword/keyword.service';
import { PrismaService } from 'src/prisma/prisma.service';

export async function buildBannerWhereFilter({
  name,
  status,
  vendorId,
  inDateRange,
  bannerType,
  shopName,
  keywordId,
  keywordService,
  latitude,
  longitude,
  prisma,
  limit = 50,
  offset = 0,
  userRole,
}: {
  name?: string;
  status?: BannerStatus | 'ALL';
  vendorId?: string;
  inDateRange?: boolean;
  bannerType: BannerType;
  shopName?: string;
  keywordId?: string;
  keywordService: KeywordService;
  latitude?: number;
  longitude?: number;
  prisma: PrismaService;
  limit?: number;
  offset?: number;
  userRole?: Role;
}): Promise<Prisma.BannerWhereInput> {
  const currentDate = new Date();
  const where: Prisma.BannerWhereInput = {
    bannerType,
    ...(userRole !== 'VENDOR' && userRole !== 'STAFF'
      ? {
          vendor: {
            vendorSubscription: {
              some: {
                endDate: {
                  gte: currentDate,
                },
                isActive: true,
              },
            },
          },
        }
      : {}),
  };

  // Basic filters
  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (inDateRange) {
    where.startDateTime = { lte: currentDate };
    where.endDateTime = { gte: currentDate };
  }

  if (shopName) {
    where.vendor = {
      ...(userRole !== 'VENDOR' && userRole !== 'STAFF'
        ? {
            vendorSubscription: {
              some: {
                endDate: {
                  gte: currentDate,
                },
                isActive: true,
              },
            },
          }
        : {}),
      shopInfo: {
        name: {
          contains: shopName,
          mode: 'insensitive',
        },
      },
    };
  }

  if (keywordId && keywordId.length > 0) {
    const keyword = await keywordService.findKeyWordById(keywordId);
    if (!keyword) {
      throw new BadRequestException('Keyword is invalid');
    }

    where.keyWordBanner = {
      some: {
        keywordId,
      },
    };
  }

  // Geo filtering like buildVendorWhereFilter
  if (latitude && longitude) {
    const filters: Prisma.Sql[] = [];

    if (vendorId) {
      filters.push(Prisma.sql`b."vendorId" = ${vendorId}`);
    }
    if (status && status !== 'ALL') {
      filters.push(Prisma.sql`b.status = ${status}::"BannerStatus"`);
    }
    if (bannerType) {
      filters.push(Prisma.sql`b."bannerType" = ${bannerType}::"BannerType"`);
    }
    if (shopName) {
      filters.push(Prisma.sql`LOWER(si.name) LIKE LOWER(${`%${shopName}%`})`);
    }
    if (keywordId) {
      filters.push(Prisma.sql`kb."keywordId" = ${keywordId}`);
    }

    const rawBanners = await prisma.$queryRaw<
      { bannerId: string }[]
    >(Prisma.sql`
      SELECT b.id AS "bannerId"
      FROM "Banner" b
      JOIN "Vendor" v ON v.id = b."vendorId"
      JOIN "ShopInfo" si ON si."vendorId" = v.id
      LEFT JOIN "KeywordBanner" kb ON kb."bannerId" = b.id
      WHERE si."location" IS NOT NULL
        AND ST_DWithin(
          si."location",
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          5000
        )
        ${filters.length ? Prisma.sql`AND ${Prisma.join(filters, ' AND ')}` : Prisma.sql``}
      ORDER BY ST_Distance(
        si."location",
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) ASC
      LIMIT ${limit} OFFSET ${offset};
    `);

    const bannerIds = rawBanners.map((b) => b.bannerId);

    if (bannerIds.length === 0) {
      where.id = { in: [''] }; // no matches
    } else {
      where.id = { in: bannerIds };
    }
  }

  return where;
}

export async function getBannerVendorsAvgRating({
  banners,
  prisma,
}: {
  banners: Banner[];
  prisma: PrismaService;
}) {
  const vendorIds = banners.map((b) => b.vendorId);

  if (vendorIds.length === 0) {
    return banners.map((banner) => ({
      ...banner,
      vendorAvgRating: null,
    }));
  }

  // Get average ratings grouped by vendorId
  const avgRatings = await prisma.review.groupBy({
    by: ['vendorId'],
    where: {
      vendorId: {
        in: vendorIds,
      },
    },
    _avg: {
      rating: true,
    },
  });

  // Map ratings by vendorId
  const vendorRatingsMap: Record<string, number | null> = Object.fromEntries(
    avgRatings.map((r) => [r.vendorId as string, r._avg.rating || null]),
  );

  // Attach avgRating as vendorAvgRating property to each banner
  const bannersWithRating = banners.map((banner) => ({
    ...banner,
    vendorAvgRating: banner.vendorId
      ? (vendorRatingsMap[banner.vendorId] ?? null)
      : null,
  }));

  return bannersWithRating;
}
