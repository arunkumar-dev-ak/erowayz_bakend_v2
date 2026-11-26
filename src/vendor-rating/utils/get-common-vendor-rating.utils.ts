import { VendorCategoryType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { maskCustomerForVendorView } from 'src/common/functions/mask-user.utils';

export interface VendorRatingSummary {
  overallRating: number;
  totalRatings: number;
  categoryType: VendorCategoryType;
  parameterAverages: Record<string, number>;
  starCounts: Record<number, number>;
  cached?: boolean;
}

export interface MyRatingResult {
  id: string;
  overallRating: number | null;
  ratings: Record<string, number> | null;
  updatedAt: Date;
}

export interface MyReviewResult {
  id: string;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

/*----- utils: format star counts distribution -----*/
export function formatStarCounts(
  rawRows: Array<{ stars: number; count: bigint }>,
): Record<number, number> {
  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rawRows) {
    if (row.stars >= 1 && row.stars <= 5) {
      starCounts[row.stars] = Number(row.count);
    }
  }
  return starCounts;
}

/*----- utils: format parameter averages -----*/
export function formatParameterAverages({
  categoryType,
  totalRatings,
  rawRow,
}: {
  categoryType: VendorCategoryType;
  totalRatings: number;
  rawRow?: Record<string, number | null>;
}): Record<string, number> {
  if (totalRatings <= 0 || !rawRow) {
    if (categoryType === VendorCategoryType.PRODUCT) {
      return {
        hygiene: 0,
        hospitality: 0,
        speed: 0,
        foodTaste: 0,
        valueForMoney: 0,
      };
    }
    if (categoryType === VendorCategoryType.BANNER) {
      return {
        productQuality: 0,
        productAvailability: 0,
        vendorBehaviour: 0,
        priceAndValue: 0,
        customerService: 0,
      };
    }
    return {
      serviceQuality: 0,
      serviceSpeed: 0,
      technicianBehaviour: 0,
      pricingAndValue: 0,
      serviceReliability: 0,
    };
  }

  if (categoryType === VendorCategoryType.PRODUCT) {
    return {
      hygiene: rawRow.hygiene ?? 0,
      hospitality: rawRow.hospitality ?? 0,
      speed: rawRow.speed ?? 0,
      foodTaste: rawRow.foodTaste ?? 0,
      valueForMoney: rawRow.valueForMoney ?? 0,
    };
  }

  if (categoryType === VendorCategoryType.BANNER) {
    return {
      productQuality: rawRow.productQuality ?? 0,
      productAvailability: rawRow.productAvailability ?? 0,
      vendorBehaviour: rawRow.vendorBehaviour ?? 0,
      priceAndValue: rawRow.priceAndValue ?? 0,
      customerService: rawRow.customerService ?? 0,
    };
  }

  return {
    serviceQuality: rawRow.serviceQuality ?? 0,
    serviceSpeed: rawRow.serviceSpeed ?? 0,
    technicianBehaviour: rawRow.technicianBehaviour ?? 0,
    pricingAndValue: rawRow.pricingAndValue ?? 0,
    serviceReliability: rawRow.serviceReliability ?? 0,
  };
}

/*----- utils: fetch category parameter averages via raw SQL -----*/
export async function fetchCategoryParameterAverages({
  vendorId,
  categoryType,
  prisma,
}: {
  vendorId: string;
  categoryType: VendorCategoryType;
  prisma: PrismaService;
}): Promise<Record<string, number | null> | undefined> {
  if (categoryType === VendorCategoryType.PRODUCT) {
    const paramAvg = await prisma.$queryRaw<
      Array<{
        hygiene: number | null;
        hospitality: number | null;
        speed: number | null;
        foodTaste: number | null;
        valueForMoney: number | null;
      }>
    >`
      SELECT 
        ROUND(AVG(("ratings"->>'hygiene')::numeric), 1)::float as "hygiene",
        ROUND(AVG(("ratings"->>'hospitality')::numeric), 1)::float as "hospitality",
        ROUND(AVG(("ratings"->>'speed')::numeric), 1)::float as "speed",
        ROUND(AVG(("ratings"->>'foodTaste')::numeric), 1)::float as "foodTaste",
        ROUND(AVG(("ratings"->>'valueForMoney')::numeric), 1)::float as "valueForMoney"
      FROM "VendorRating"
      WHERE "vendorId" = ${vendorId} AND "ratings" IS NOT NULL;
    `;
    return paramAvg[0] as Record<string, number | null> | undefined;
  } else if (categoryType === VendorCategoryType.BANNER) {
    const paramAvg = await prisma.$queryRaw<
      Array<{
        productQuality: number | null;
        productAvailability: number | null;
        vendorBehaviour: number | null;
        priceAndValue: number | null;
        customerService: number | null;
      }>
    >`
      SELECT 
        ROUND(AVG(("ratings"->>'productQuality')::numeric), 1)::float as "productQuality",
        ROUND(AVG(("ratings"->>'productAvailability')::numeric), 1)::float as "productAvailability",
        ROUND(AVG(("ratings"->>'vendorBehaviour')::numeric), 1)::float as "vendorBehaviour",
        ROUND(AVG(("ratings"->>'priceAndValue')::numeric), 1)::float as "priceAndValue",
        ROUND(AVG(("ratings"->>'customerService')::numeric), 1)::float as "customerService"
      FROM "VendorRating"
      WHERE "vendorId" = ${vendorId} AND "ratings" IS NOT NULL;
    `;
    return paramAvg[0] as Record<string, number | null> | undefined;
  } else if (categoryType === VendorCategoryType.SERVICE) {
    const paramAvg = await prisma.$queryRaw<
      Array<{
        serviceQuality: number | null;
        serviceSpeed: number | null;
        technicianBehaviour: number | null;
        pricingAndValue: number | null;
        serviceReliability: number | null;
      }>
    >`
      SELECT 
        ROUND(AVG(("ratings"->>'serviceQuality')::numeric), 1)::float as "serviceQuality",
        ROUND(AVG(("ratings"->>'serviceSpeed')::numeric), 1)::float as "serviceSpeed",
        ROUND(AVG(("ratings"->>'technicianBehaviour')::numeric), 1)::float as "technicianBehaviour",
        ROUND(AVG(("ratings"->>'pricingAndValue')::numeric), 1)::float as "pricingAndValue",
        ROUND(AVG(("ratings"->>'serviceReliability')::numeric), 1)::float as "serviceReliability"
      FROM "VendorRating"
      WHERE "vendorId" = ${vendorId} AND "ratings" IS NOT NULL;
    `;
    return paramAvg[0] as Record<string, number | null> | undefined;
  }
  return undefined;
}

/*----- utils: fetch vendor rating summary with Redis caching -----*/
export async function fetchVendorRatingSummary({
  vendorId,
  categoryType,
  prisma,
  redis,
}: {
  vendorId: string;
  categoryType: VendorCategoryType;
  prisma: PrismaService;
  redis: RedisService;
}): Promise<VendorRatingSummary> {
  const cacheKey = `vendor:rating:summary:${vendorId}`;

  // Check Redis cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as VendorRatingSummary;
      return { ...parsed, cached: true };
    }
  } catch {
    // Redis fail-safe
  }

  /*----- DB calling: compute aggregate overall rating & count -----*/
  const aggregate = await prisma.vendorRating.aggregate({
    where: { vendorId, overallRating: { not: null } },
    _count: { _all: true },
    _avg: { overallRating: true },
  });

  const totalRatings = aggregate._count._all;
  const overallRating = aggregate._avg.overallRating
    ? Number(aggregate._avg.overallRating.toFixed(1))
    : 0;

  /*----- DB calling: compute 1-to-5 star distribution -----*/
  const starCountsResult = await prisma.$queryRaw<
    Array<{ stars: number; count: bigint }>
  >`
    SELECT ROUND("overallRating")::int AS stars, COUNT(*)::bigint AS count
    FROM "VendorRating"
    WHERE "vendorId" = ${vendorId} AND "overallRating" IS NOT NULL
    GROUP BY ROUND("overallRating");
  `;

  const starCounts = formatStarCounts(starCountsResult);

  /*----- DB calling: compute category parameter averages -----*/
  const rawRow =
    totalRatings > 0
      ? await fetchCategoryParameterAverages({ vendorId, categoryType, prisma })
      : undefined;

  const parameterAverages = formatParameterAverages({
    categoryType,
    totalRatings,
    rawRow,
  });

  const summary: VendorRatingSummary = {
    overallRating,
    totalRatings,
    categoryType,
    parameterAverages,
    starCounts,
  };

  // Store in Redis (TTL: 24 hours = 86400s)
  try {
    await redis.set(cacheKey, JSON.stringify(summary), 86400);
  } catch {
    // Redis fail-safe
  }

  return { ...summary, cached: false };
}

/*----- utils: fetch customer's previous rating & review -----*/
export async function fetchMyRatingAndReview({
  vendorId,
  userId,
  prisma,
  isMyRatingNeeded,
  isMyReviewNeeded,
}: {
  vendorId: string;
  userId: string;
  prisma: PrismaService;
  isMyRatingNeeded: boolean;
  isMyReviewNeeded: boolean;
}): Promise<{
  myRating: MyRatingResult | null;
  myReview: MyReviewResult | null;
}> {
  if (!isMyRatingNeeded && !isMyReviewNeeded) {
    return { myRating: null, myReview: null };
  }

  const existing = await prisma.vendorRating.findUnique({
    where: {
      userId_vendorId: {
        userId,
        vendorId,
      },
    },
  });

  if (!existing) {
    return { myRating: null, myReview: null };
  }

  const myRating: MyRatingResult | null =
    isMyRatingNeeded && (existing.ratings || existing.overallRating !== null)
      ? {
          id: existing.id,
          overallRating: existing.overallRating,
          ratings: (existing.ratings as Record<string, number>) ?? null,
          updatedAt: existing.updatedAt,
        }
      : null;

  const myReview: MyReviewResult | null =
    isMyReviewNeeded && existing.review
      ? {
          id: existing.id,
          review: existing.review,
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
        }
      : null;

  return { myRating, myReview };
}

/*----- utils: fetch paginated vendor reviews & total count -----*/
export async function fetchPaginatedVendorReviews({
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
  const [reviews, totalCount] = await Promise.all([
    prisma.vendorRating.findMany({
      where: { vendorId },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageRef: true,
            relativeUrl: true,
            status: true,
            accountStatus: true,
          },
        },
      },
    }),
    prisma.vendorRating.count({ where: { vendorId } }),
  ]);

  const sanitizedReviews = reviews.map((review) => ({
    ...review,
    user: maskCustomerForVendorView(review.user),
  }));

  return { reviews: sanitizedReviews, totalCount };
}
