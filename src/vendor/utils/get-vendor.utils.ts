import { Prisma, Vendor } from '@prisma/client';
import {
  GetVendorQueryDto,
  ShopStatusBooleanMap,
  UserStatusBooleanMap,
} from '../dto/get-vendor-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export async function buildVendorWhereFilter({
  query,
  limit,
  offset,
  prisma,
}: {
  query: GetVendorQueryDto;
  limit: number;
  offset: number;
  prisma: PrismaService;
}) {
  const where: Prisma.VendorWhereInput = {};

  const {
    vendorCategoryType,
    vendorName,
    vendorStatus,
    vendorTypeId,
    shopStatus,
    keywordId,
    latitude,
    longitude,
    serviceOptionId,
    vendorId,
  } = query;

  if (latitude && longitude) {
    const filters: Prisma.Sql[] = [];

    if (vendorTypeId) {
      filters.push(Prisma.sql`vt.id = ${vendorTypeId}`);
    }
    if (vendorCategoryType) {
      filters.push(
        Prisma.sql`vt.type = ${vendorCategoryType}::"VendorCategoryType"`,
      );
    }
    if (vendorName) {
      filters.push(Prisma.sql`LOWER(u.name) LIKE LOWER(${`%${vendorName}%`})`);
    }
    if (vendorStatus) {
      filters.push(
        Prisma.sql`u.status = ${UserStatusBooleanMap[vendorStatus]}`,
      );
    }
    if (shopStatus) {
      filters.push(
        Prisma.sql`s."isShopOpen" = ${ShopStatusBooleanMap[shopStatus]}`,
      );
    }
    if (keywordId) {
      filters.push(Prisma.sql`svk."keywordId" = ${keywordId}`);
    }
    if (serviceOptionId) {
      filters.push(Prisma.sql`vso."serviceOptionId" = ${serviceOptionId}`);
    }
    if (vendorId) {
      filters.push(Prisma.sql`v.id = ${vendorId}`);
    }

    const rawVendors = await prisma.$queryRaw<
      { vendorId: string }[]
    >(Prisma.sql`
  SELECT s."vendorId"
  FROM "ShopInfo" s
  JOIN "Vendor" v ON v.id = s."vendorId"
  JOIN "User" u ON u.id = v."userId"
  JOIN "VendorServiceOption" vso ON vso."vendorId" = s."vendorId"
  LEFT JOIN "VendorType" vt ON vt.id = v."vendorTypeId"
  LEFT JOIN "ServiceVendorKeyword" svk ON svk."vendorId" = v.id
  WHERE s."location" IS NOT NULL
    AND ST_DWithin(
      s."location",
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      5000
    )
    ${filters.length ? Prisma.sql`AND ${Prisma.join(filters, ' AND ')}` : Prisma.sql``}
  ORDER BY ST_Distance(
    s."location",
    ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
  ) ASC
  LIMIT ${limit} OFFSET ${offset};
  `);

    const vendorIds = rawVendors.map((v) => v.vendorId);

    if (vendorIds.length === 0) {
      where.id = { in: [''] };
    } else {
      where.id = { in: vendorIds };
    }

    return where;
  }

  if (vendorCategoryType || vendorTypeId) {
    where.vendorType = {
      ...(vendorCategoryType ? { type: vendorCategoryType } : {}),
      ...(vendorTypeId ? { id: vendorTypeId } : {}),
    };
  }

  if (serviceOptionId) {
    where.vendorServiceOption = {
      some: {
        serviceOptionId,
      },
    };
  }

  if (vendorName || vendorStatus) {
    where.User = {
      ...(vendorName
        ? { name: { contains: vendorName, mode: 'insensitive' } }
        : {}),
      ...(vendorStatus ? { status: UserStatusBooleanMap[vendorStatus] } : {}),
    };
  }

  if (shopStatus) {
    where.shopInfo = {
      isShopOpen: ShopStatusBooleanMap[shopStatus],
    };
  }

  if (keywordId) {
    where.serviceVendorKeyword = {
      some: {
        keywordId: keywordId,
      },
    };
  }

  if (vendorId) {
    where.id = vendorId;
  }

  return where;
}

export function vendorInclude(userId?: string) {
  const include: Prisma.VendorInclude = {
    vendorType: true,
    serviceVendorKeyword: {
      include: {
        keyword: true,
      },
    },
    shopInfo: {
      include: {
        license: {
          include: {
            licenseCategory: true,
          },
        },
        shopCategory: true,
        shopCity: true,
      },
    },
    vendorServiceOption: {
      select: {
        id: true,
        status: true,
        serviceOption: {
          select: {
            id: true,
            name: true,
            tamilName: true,
            serviceOptImageRef: true,
            relativeUrl: true,
          },
        },
      },
    },
    User: {
      select: {
        id: true,
        name: true,
        nameTamil: true,
        imageRef: true,
        status: true,
        email: true,
        mobile: true,
        referrer: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            imageRef: true,
            status: true,
            email: true,
            mobile: true,
          },
        },
      },
    },
    service: {
      include: {
        serviceOption: true,
      },
    },
  };

  if (userId) {
    include.favouriteVendorForCustomer = {
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    };
  }

  return include;
}

export async function getVendorAvgRating({
  vendors,
  prisma,
}: {
  vendors: Vendor[];
  prisma: PrismaService;
}) {
  const vendorIds = vendors.map((v) => v.id);

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

  const vendorRatingsMap: Record<string, number | null> = Object.fromEntries(
    avgRatings.map((r) => [r.vendorId as string, r._avg.rating]),
  );

  const vendorsWithRating = vendors.map((vendor) => ({
    ...vendor,
    avgRating: vendorRatingsMap[vendor.id] ?? null,
  }));

  return vendorsWithRating;
}
