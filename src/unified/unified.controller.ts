import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';
import { extractUserFromRequest } from 'src/common/functions/extractUserId';
import { UnifiedService } from './unified.service';
import { GetUnifiedStorefrontQueryDto } from './dto/get-unified-storefront-query.dto';

@ApiTags('Unified')
@Controller('unified')
export class UnifiedController {
  constructor(private readonly unifiedService: UnifiedService) {}

  // =========================================================================
  // Dynamic Storefront Endpoint (PRODUCT, SERVICE & BANNER)
  // Dynamically inspects vendor.vendorType.type and returns the tailored storefront.
  // =========================================================================
  @Get('storefront/:vendorId')
  @ApiOperation({
    summary:
      'Retrieve unified vendor storefront (Dynamic: PRODUCT, SERVICE, BANNER)',
    description:
      'Dynamically resolves the vendor category from vendorType. For PRODUCT vendors, returns active categories, menu items, and last delivered order. For SERVICE vendors, returns active service options, services/sub-services with pricing, and last completed service booking. For BANNER vendors, returns active valid banners and last completed banner booking. All categories receive common profile info, operating timings, Redis-cached rating summary, and customer rating.',
  })
  @ApiParam({
    name: 'vendorId',
    type: String,
    description: 'Vendor UUID',
  })
  @UseGuards(FetchUserGuard)
  async getStorefront(
    @Param('vendorId', new ParseUUIDPipe()) vendorId: string,
    @Query() query: GetUnifiedStorefrontQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = extractUserFromRequest(req);
    return await this.unifiedService.getStorefront({
      vendorId,
      query,
      userId: user?.id,
      res,
    });
  }
}
