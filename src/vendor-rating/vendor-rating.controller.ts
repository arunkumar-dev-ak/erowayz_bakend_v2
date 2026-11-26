import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';
import {
  extractUserFromRequest,
  extractUserIdFromRequest,
} from 'src/common/functions/extractUserId';
import { VendorRatingService } from './vendor-rating.service';
import { RateVendorDto } from './dto/rate-vendor.dto';
import { GetVendorRatingQueryDto } from './dto/get-vendor-rating.dto';
import { GetBookingVendorRatingQueryDto } from './dto/get-booking-vendor-rating.dto';

@ApiTags('vendor-rating')
@Controller('vendor-rating')
export class VendorRatingController {
  constructor(private readonly vendorRatingService: VendorRatingService) {}

  @ApiOperation({
    summary: 'Submit or update 5-parameter rating for a vendor (Customer only)',
    description:
      'Creates or updates rating breakdown and review for either a completed Order or Booking. Author ownership is validated.',
  })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('rate')
  async createVendorRating(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: RateVendorDto,
  ) {
    const userId = extractUserIdFromRequest(req);

    return await this.vendorRatingService.upsertRating({
      userId,
      body,
      res,
    });
  }

  @ApiOperation({
    summary:
      'Get vendor ratings summary and paginated reviews for Orders (Product Vendors)',
    description:
      'Returns overall summary, 1-5 star distribution, product category parameter averages, paginated reviews list, plus customer-specific rating, review, and last delivered order when authenticated.',
  })
  @ApiParam({
    name: 'vendorId',
    type: String,
    description: 'Vendor UUID',
  })
  @UseGuards(FetchUserGuard)
  @Get('order/vendor/:vendorId')
  async getOrderVendorRating(
    @Req() req: Request,
    @Res() res: Response,
    @Param('vendorId', new ParseUUIDPipe()) vendorId: string,
    @Query() query: GetVendorRatingQueryDto,
  ) {
    const user = extractUserFromRequest(req);

    return await this.vendorRatingService.getOrderVendorRatings({
      vendorId,
      query,
      userId: user?.id,
      res,
    });
  }

  @ApiOperation({
    summary:
      'Get vendor ratings summary and paginated reviews for Bookings (Service & Banner Vendors)',
    description:
      'Returns overall summary, 1-5 star distribution, service/banner category parameter averages, paginated reviews list, plus customer-specific rating, review, and last completed booking (Service or Banner) when authenticated.',
  })
  @ApiParam({
    name: 'vendorId',
    type: String,
    description: 'Vendor UUID',
  })
  @UseGuards(FetchUserGuard)
  @Get('booking/vendor/:vendorId')
  async getBookingVendorRating(
    @Req() req: Request,
    @Res() res: Response,
    @Param('vendorId', new ParseUUIDPipe()) vendorId: string,
    @Query() query: GetBookingVendorRatingQueryDto,
  ) {
    const user = extractUserFromRequest(req);

    return await this.vendorRatingService.getBookingVendorRatings({
      vendorId,
      query,
      userId: user?.id,
      res,
    });
  }
}
