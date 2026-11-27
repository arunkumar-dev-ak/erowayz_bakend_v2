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
import { GetUnifiedVendorRatingQueryDto } from './dto/get-unified-vendor-rating.dto';

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
      'Retrieve unified vendor ratings and reviews (Dynamic: PRODUCT, SERVICE, BANNER)',
    description:
      'Returns overall summary, category parameter averages, and paginated review list sorted by newest first (each containing individual customer 5-parameter ratings breakdown and masked user info), plus customer-specific previous rating and last eligible transaction when authenticated.',
  })
  @ApiParam({
    name: 'vendorId',
    type: String,
    description: 'Vendor UUID',
  })
  @UseGuards(FetchUserGuard)
  @Get('vendor/:vendorId')
  async getVendorRatings(
    @Req() req: Request,
    @Res() res: Response,
    @Param('vendorId', new ParseUUIDPipe()) vendorId: string,
    @Query() query: GetUnifiedVendorRatingQueryDto,
  ) {
    const user = extractUserFromRequest(req);

    return await this.vendorRatingService.getVendorRatings({
      vendorId,
      query,
      userId: user?.id,
      res,
    });
  }
}
