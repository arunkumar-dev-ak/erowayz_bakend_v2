import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReviewService } from './review.service';
import { GetReviewQueryDto } from './dto/get-review-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { Roles } from 'src/common/roles/roles.docorator';

@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Get reviews with optional filters' })
  @Get()
  async getReview(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetReviewQueryDto,
  ) {
    await this.reviewService.getReview({
      res,
      query,
      limit: Number(query.limit || '10'),
      offset: Number(query.offset || '0'),
    });
  }

  @ApiOperation({ summary: 'Create a new review' })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('create')
  async createReview(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateReviewDto,
  ) {
    const userId = extractUserIdFromRequest(req);

    await this.reviewService.createReview({
      userId,
      body,
      res,
    });
  }

  @ApiOperation({ summary: 'Update an existing review' })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @Put('update/:id')
  async updateReview(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateReviewDto,
    @Param('id') reviewId: string,
  ) {
    const userId = extractUserIdFromRequest(req);

    await this.reviewService.updateReview({
      body,
      res,
      reviewId,
      userId,
    });
  }

  @ApiOperation({ summary: 'Delete a review' })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @Delete('remove/:id')
  async deleteReview(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') reviewId: string,
  ) {
    const userId = extractUserIdFromRequest(req);

    await this.reviewService.deleteReview({
      userId,
      res,
      reviewId,
    });
  }
}
