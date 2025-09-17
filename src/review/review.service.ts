import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { CreateReviewUtils } from './utils/create-review.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { ResponseService } from 'src/response/response.service';
import { VendorService } from 'src/vendor/vendor.service';
import { OrderService } from 'src/order/order.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UpdateReviewUtils } from './utils/update-review.utils';
import { GetReviewQueryDto } from './dto/get-review-query.dto';
import { buildReviewWhereFilter, ratingCount } from './utils/get-review.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly response: ResponseService,
    private readonly vendorService: VendorService,
    private readonly orderService: OrderService,
  ) {}
  async getReview({
    res,
    query,
    limit,
    offset,
  }: {
    res: Response;
    query: GetReviewQueryDto;
    limit: number;
    offset: number;
  }) {
    const initialDate = new Date();

    const where = buildReviewWhereFilter({ query });

    const { totalCount, averageRating, finalRatingCount } = await ratingCount({
      prisma: this.prisma,
      where,
    });

    const reviews = await this.prisma.review.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageRef: true,
          },
        },
        vendor: true,
        orderItem: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      vendorId: query.vendorId,
      userId: query.userId,
      itemId: query.itemId,
      reviewId: query.reviewId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'review',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: { averageRating, finalRatingCount, reviews },
      meta,
      message: 'Reviews retrieved successfully',
      statusCode: 200,
    });
  }

  async createReview({
    userId,
    body,
    res,
  }: {
    userId: string;
    body: CreateReviewDto;
    res: Response;
  }) {
    const initialDate = new Date();

    const upsertQuery: Prisma.ReviewUpsertArgs = await CreateReviewUtils({
      body,
      userId,
      orderService: this.orderService,
      vendorService: this.vendorService,
    });

    const upsertedReview = await this.prisma.review.upsert(upsertQuery);

    return this.response.successResponse({
      initialDate,
      res,
      message: 'Review created Successfully',
      data: upsertedReview,
      statusCode: 200,
    });
  }

  async updateReview({
    body,
    res,
    reviewId,
    userId,
  }: {
    body: UpdateReviewDto;
    res: Response;
    reviewId: string;
    userId: string;
  }) {
    const initialDate = new Date();

    const updateData: Prisma.ReviewUpdateInput = await UpdateReviewUtils({
      body,
      userId,
      reviewService: this,
      reviewId,
    });

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    return this.response.successResponse({
      initialDate,
      res,
      message: 'Review updated Successfully',
      data: updatedReview,
      statusCode: 200,
    });
  }

  async deleteReview({
    userId,
    res,
    reviewId,
  }: {
    userId: string;
    res: Response;
    reviewId: string;
  }) {
    const initialDate = new Date();

    // Step 1: Check if the review exists
    const existingReview = await this.findReviewById(reviewId);
    if (!existingReview) {
      throw new NotFoundException('Review not found');
    }

    // Step 2: Check if the review belongs to the current user
    if (existingReview.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this review',
      );
    }

    // Step 3: Delete the review
    const deletedReview = await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Step 4: Send response
    return this.response.successResponse({
      initialDate,
      res,
      message: 'Review deleted Successfully',
      data: deletedReview,
      statusCode: 200,
    });
  }

  /*----- helper func -----*/
  async findReviewById(reviewId: string) {
    return await this.prisma.review.findUnique({ where: { id: reviewId } });
  }
}
