import { Prisma } from '@prisma/client';
import { GetReviewQueryDto } from '../dto/get-review-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export function buildReviewWhereFilter({
  query,
}: {
  query: GetReviewQueryDto;
}): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = {};

  const { vendorId, userId, itemId, reviewId } = query;

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (reviewId) {
    where.id = reviewId;
  }

  if (itemId) {
    where.orderItem = {
      itemId: itemId,
    };
  }

  return where;
}

export async function ratingCount({
  prisma,
  where,
}: {
  prisma: PrismaService;
  where: Prisma.ReviewWhereInput;
}) {
  const groupedRatings = await prisma.review.groupBy({
    by: ['rating'],
    where,
    _count: true,
  });

  let totalSum = 0;
  let totalCount = 0;

  const finalRatingCount: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const groupRating of groupedRatings) {
    const r = groupRating.rating;
    if (r != null) {
      finalRatingCount[r] = groupRating._count;
      totalSum += r * groupRating._count;
      totalCount += groupRating._count;
    }
  }

  const averageRating =
    totalCount > 0 ? parseFloat((totalSum / totalCount).toFixed(1)) : 0;

  return { totalCount, averageRating, finalRatingCount };
}
