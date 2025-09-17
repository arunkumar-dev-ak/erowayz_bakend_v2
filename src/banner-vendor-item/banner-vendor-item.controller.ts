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
import { BannerVendorItemService } from './banner-vendor-item.service';
import { Request, Response } from 'express';
import { CreateBannerVendorItemDto } from './dto/create-banner-vendor-item.dto';
import { UpdateBannerVendorItemDto } from './dto/update-banner-vendor-item.dto';
import { GetBannerVendorItemQueryDto } from './dto/get-banner-vendor-item-query.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BannerVendorItemProductStatusDto } from './dto/banner-vendor-item-productstatus.dto';
import { BannerVendorItemStatusDto } from './dto/banner-vendor-item-status.dto';

@ApiTags('Banner Vendor Item')
@Controller('banner-vendor-item')
export class BannerVendorItemController {
  constructor(
    private readonly bannerVendorItemService: BannerVendorItemService,
  ) {}

  @ApiOperation({ summary: 'Get banner vendor items' })
  @UseGuards(FetchUserGuard)
  @Get()
  async getBannerVendorItem(
    @Res() res: Response,
    @Query() query: GetBannerVendorItemQueryDto,
  ) {
    const { offset = 0, limit = 10 } = query;
    return await this.bannerVendorItemService.getBannerVendorItem({
      res,
      query,
      offset: Number(offset),
      limit: Number(limit),
    });
  }

  @ApiOperation({ summary: 'Create banner vendor item' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 3))
  async createBannerVendorItem(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateBannerVendorItemDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const vendorId = extractVendorIdFromRequest(req);
    return await this.bannerVendorItemService.createBannerVendorItem({
      res,
      body,
      vendorId,
      images,
    });
  }

  @ApiOperation({ summary: 'Update banner vendor item' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:bannerVendorItemId')
  @UseInterceptors(FilesInterceptor('images', 3))
  async updateBannerVendorItem(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bannerVendorItemId') bannerVendorItemId: string,
    @Body() body: UpdateBannerVendorItemDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.bannerVendorItemService.updateBannerVendorItem({
      res,
      body,
      vendorId,
      bannerVendorItemId,
      images,
    });
  }

  @ApiOperation({ summary: 'Update product status of banner vendor item' })
  @ApiBearerAuth()
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('update-product-status/:bannerVendorItemId')
  async updateBannerVendorItemProductStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bannerVendorItemId') bannerVendorItemId: string,
    @Body() body: BannerVendorItemProductStatusDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.bannerVendorItemService.updateBannerVendorItemProductStatus(
      {
        res,
        bannerVendorItemId,
        body,
        vendorId,
      },
    );
  }

  @ApiOperation({ summary: 'Update status of banner vendor item' })
  @ApiBearerAuth()
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('update-status/:bannerVendorItemId')
  async updateBannerVendorItemStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bannerVendorItemId') bannerVendorItemId: string,
    @Body() body: BannerVendorItemStatusDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.bannerVendorItemService.updateBannerVendorItemStatus({
      res,
      bannerVendorItemId,
      body,
      vendorId,
    });
  }

  @ApiOperation({ summary: 'Delete a banner vendor item' })
  @ApiBearerAuth()
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:bannerVendorItemId')
  async deleteBannerVendorItem(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bannerVendorItemId') bannerVendorItemId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.bannerVendorItemService.deleteBannerVendorItem({
      res,
      bannerVendorItemId,
      vendorId,
    });
  }
}
