import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { Request, Response } from 'express';
import { BannerType, Role, User } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { UpdateBannerStatusDto } from './dto/updatestatus-banner.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractFileFromReq } from 'src/common/functions/bannerfunctions';
import { GetBannerQuery } from './dto/get-banner-query.dto';
import { GetPopularBannerQueryDto } from './dto/get-popularbanner-query.dto';
import { GetBannerForAdminQueryDto } from './dto/get-banner-for-admin.dto';
import { extractVendorSubFromRequest } from 'src/common/functions/extact-sub';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';
import { extractUserFromRequest } from 'src/common/functions/extractUserId';

@ApiTags('banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @ApiOperation({ summary: 'Get regular banners with filtering options' })
  @Get('regular')
  @UseGuards(FetchUserGuard)
  async getRegularBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetBannerQuery,
  ) {
    const user: User | undefined = extractUserFromRequest(req);

    const parsedQuery = Object.assign(new GetBannerQuery(), query);
    const inDateRange =
      query.inDateRange === undefined ? true : query.inDateRange === 'true';
    return await this.bannerService.getRegularBanner({
      ...parsedQuery,
      inDateRange,
      offset: Number(parsedQuery.offset),
      limit: Number(parsedQuery.limit),
      res,
      userRole: user?.role,
    });
  }

  @ApiOperation({ summary: 'Get product banners with filtering options' })
  @Get('product')
  async getBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetBannerQuery,
  ) {
    const inDateRange = query.inDateRange === 'true';
    const user: User | undefined = extractUserFromRequest(req);

    return await this.bannerService.getProductBanner({
      ...query,
      inDateRange,
      offset: Number(query.offset),
      limit: Number(query.limit),
      res,
      userRole: user?.role,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin/:bannerType')
  async getBannerForAdmin(
    @Res() res: Response,
    @Query() query: GetBannerForAdminQueryDto,
    @Param('bannerType') bannerType: BannerType,
  ) {
    return await this.bannerService.getBannerForAdmin({
      type: bannerType,
      offset: Number(query.offset),
      limit: Number(query.limit),
      res,
      query,
    });
  }

  @ApiOperation({ summary: 'Get Popular banners with filtering options' })
  @Get('popular/:vendorType')
  @ApiParam({
    name: 'bannerType',
    enum: BannerType,
    required: true,
    description: 'Type of the banner (e.g., PRODUCT, CATEGORY, etc.)',
  })
  async getPopularProductBanner(
    @Res() res: Response,
    @Query() query: GetPopularBannerQueryDto,
    @Param('vendorType') vendorType: string,
  ) {
    if (vendorType !== 'service' && vendorType !== 'product') {
      throw new BadRequestException('Params either be service or product');
    }
    return await this.bannerService.getPopularityBanner({
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
      res,
      bannerType:
        vendorType === 'service' ? BannerType.PRODUCT : BannerType.REGULAR,
    });
  }

  @ApiOperation({ summary: 'Get a banner by its ID' })
  @Get('getBannerById/:id')
  @ApiParam({ name: 'id', type: String, description: 'The ID of the banner' })
  async getBannerById(@Res() res: Response, @Param('id') bannerId: string) {
    return await this.bannerService.getBannerById({ res, bannerId });
  }

  @ApiOperation({ summary: 'Create a new banner' })
  @ApiBody({ type: CreateBannerDto })
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fgImage', maxCount: 1 },
      { name: 'bgImage', maxCount: 1 },
      { name: 'itemImages', maxCount: 3 },
    ]),
  )
  @Post('create')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  async createBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateBannerDto,
    @UploadedFiles()
    files: {
      fgImage?: Express.Multer.File;
      bgImage?: Express.Multer.File;
      itemImages?: Express.Multer.File[];
    },
  ) {
    if (
      (!files.fgImage && !files.bgImage) ||
      (files.fgImage && files.bgImage)
    ) {
      throw new BadRequestException(
        'Either fgImage(Foreground Image) or bgImage(Background Image) is required',
      );
    }

    if (files.fgImage && !body.fgImagePosition) {
      throw new BadRequestException(
        'Image position is required if you provide an Foreground image',
      );
    }
    const vendorId = extractVendorIdFromRequest(req);
    const currentVendorSub = extractVendorSubFromRequest(req);
    return await this.bannerService.createBanner({
      res,
      body,
      vendorId,
      itemImages: files?.itemImages ?? [],
      fgImage: files?.fgImage,
      bgImage: files?.bgImage,
      currentVendorSubscription: currentVendorSub,
    });
  }

  @ApiOperation({ summary: 'Update a banner' })
  @ApiBody({ type: UpdateBannerDto })
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fgImage', maxCount: 1 },
      { name: 'bgImage', maxCount: 1 },
      { name: 'itemImages', maxCount: 3 },
    ]),
  )
  @Put('update/:id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the banner',
  })
  async updateBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateBannerDto,
    @Param('id') bannerId: string,
    @UploadedFiles()
    files: {
      fgImage?: Express.Multer.File[];
      bgImage?: Express.Multer.File[];
      itemImages?: Express.Multer.File[];
    },
  ) {
    if (!req.body) {
      throw new BadRequestException('No fields are provided for update');
    }

    const fgImage: Express.Multer.File[] | undefined | null =
      extractFileFromReq({
        req,
        fieldName: 'fgImage',
        files,
      });
    const bgImage: Express.Multer.File[] | undefined | null =
      extractFileFromReq({
        req,
        fieldName: 'bgImage',
        files,
      });
    const itemImages: Express.Multer.File[] | undefined | null =
      extractFileFromReq({
        req,
        fieldName: 'itemImages',
        files,
      });

    if (fgImage && bgImage) {
      throw new BadRequestException(
        'Only one of fgImage (Foreground Image) or bgImage (Background Image) can be provided',
      );
    } else if (
      fgImage === null &&
      (bgImage === null || bgImage === undefined)
    ) {
      throw new BadRequestException(
        'if fgImage is sended as null and bgImage must present',
      );
    } else if (bgImage === null && (fgImage == null || fgImage === undefined)) {
      throw new BadRequestException(
        'if bgImage is sended as null and fgImage must present',
      );
    }
    extractVendorSubFromRequest(req);

    return await this.bannerService.updateBanner({
      res,
      body,
      vendorId: extractVendorIdFromRequest(req),
      bannerId,
      itemImages: itemImages,
      fgImage: files?.fgImage,
      bgImage: files?.bgImage,
    });
  }

  @ApiOperation({ summary: 'Update the status of a banner' })
  @ApiBody({ type: UpdateBannerStatusDto })
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('updateStatus/:id')
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the banner',
  })
  async updateBannerStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') bannerId: string,
    @Body() body: UpdateBannerStatusDto,
  ) {
    extractVendorSubFromRequest(req);

    return await this.bannerService.updatedBannerStatus({
      res,
      body,
      vendorId: extractVendorIdFromRequest(req),
      bannerId,
    });
  }

  @ApiOperation({ summary: 'Delete a banner' })
  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:id')
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the banner',
  })
  async deleteBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') bannerId: string,
  ) {
    return await this.bannerService.deleteBanner({
      res,
      bannerId,
      vendorId: extractVendorIdFromRequest(req),
    });
  }
}
