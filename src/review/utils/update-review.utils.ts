import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Prisma } from '@prisma/client';
import { ReviewService } from '../review.service';

export async function UpdateReviewUtils({
  body,
  userId,
  reviewService,
  reviewId,
}: {
  body: CreateReviewDto;
  userId: string;
  reviewService: ReviewService;
  reviewId: string;
}): Promise<Prisma.ReviewUpdateInput> {
  const { review, rating } = body;

  //Check if the review exists
  const existingReview = await reviewService.findReviewById(reviewId);
  if (!existingReview) {
    throw new NotFoundException('Review not found');
  }

  // Check if the user is authorized
  if (existingReview.userId !== userId) {
    throw new ForbiddenException(
      'You are not authorized to update this review',
    );
  }

  // Build and return the update input
  const updateArgs: Prisma.ReviewUpdateInput = {
    ...(review !== undefined && { review }),
    ...(rating !== undefined && { rating }),
  };

  return updateArgs;
}
