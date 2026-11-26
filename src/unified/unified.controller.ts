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
import { GetUnifiedProductInfoQueryDto } from './dto/get-unified-product-info-query.dto';

@ApiTags('Unified')
@Controller('unified')
export class UnifiedController {
  constructor(private readonly unifiedService: UnifiedService) {}

  @Get('product-info/:vendorId')
  @ApiOperation({
    summary:
      'Retrieve unified product vendor storefront details (Product Info)',
    description:
      'Consolidates vendor profile, rating summary, shop timings, available categories, and paginated items in a single call for product info.',
  })
  @ApiParam({
    name: 'vendorId',
    type: String,
    description: 'Vendor UUID',
  })
  @UseGuards(FetchUserGuard)
  async getProductInfo(
    @Param('vendorId', new ParseUUIDPipe()) vendorId: string,
    @Query() query: GetUnifiedProductInfoQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = extractUserFromRequest(req);
    return await this.unifiedService.getProductInfo({
      vendorId,
      query,
      userId: user?.id,
      res,
    });
  }
}
