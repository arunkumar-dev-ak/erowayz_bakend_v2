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
import { ItemService } from './item.service';
import { Request, Response } from 'express';
import { CreateItemDto } from './dto/create-item.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Role, User } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateProductStatusDto } from './dto/update-productstatus-item.dto';
import { UpdateItemStatus } from './dto/update-itemstatus.dto';
import { RoleGuard } from 'src/common/guards/role.guard';
import { GetItemQueryDto } from './dto/get-item-query.dto';
import { GetPopularItemQueryDto } from './dto/get-popularitem-query.dto';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';
import { extractUserFromRequest } from 'src/common/functions/extractUserId';
import { FeaturePermission } from 'src/common/decorator/featurepermission.decorator';
import { extractVendorSubFromRequest } from 'src/common/functions/extact-sub';

@ApiTags('Items')
@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiOperation({
    summary: 'Retrieve items with optional filtering and pagination',
  })
  @UseGuards(FetchUserGuard)
  @Get()
  async getItem(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetItemQueryDto,
  ) {
    const { offset = 0, limit = 10 } = query;
    const user: User | undefined = extractUserFromRequest(req);
    return await this.itemService.getItem({
      res,
      query,
      offset: Number(offset),
      limit: Number(limit),
      userId: user?.id,
    });
  }

  @ApiOperation({ summary: 'Get Popular items with filtering options' })
  @UseGuards(FetchUserGuard)
  @Get('popular')
  async getPopularProductBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetPopularItemQueryDto,
  ) {
    const user: User | undefined = extractUserFromRequest(req);
    return await this.itemService.getPopularItem({
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
      res,
      userId: user?.id,
    });
  }

  @ApiOperation({ summary: 'Create a new item' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.STAFF, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @UseInterceptors(FilesInterceptor('files', 3))
  async createItem(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateItemDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files.length == 0) {
      throw new BadRequestException(
        'At least one item image is required in (files field)',
      );
    }
    const vendorId = extractVendorIdFromRequest(req);
    return await this.itemService.createItem({
      vendorId,
      res,
      body,
      itemImages: files,
    });
  }

  @ApiOperation({ summary: 'Update an existing item' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.STAFF, Role.VENDOR)
  @FeaturePermission('stockEditable')
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:itemId')
  @UseInterceptors(FilesInterceptor('files', 3))
  async updateItem(
    @Req() req: Request,
    @Res() res: Response,
    @Param('itemId') itemId: string,
    @Body() body: UpdateItemDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    const vendorSub = extractVendorSubFromRequest(req);
    return await this.itemService.updateItem({
      itemId,
      vendorId,
      res,
      body,
      itemImages: files,
      currentSubscription: vendorSub,
    });
  }

  @ApiOperation({ summary: 'Update the product status of an item' })
  @ApiBearerAuth()
  @Roles(Role.STAFF, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('updateProductStatus/:itemId')
  async changeProductStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateProductStatusDto,
    @Param('itemId') itemId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    const vendorSub = extractVendorSubFromRequest(req);
    return await this.itemService.changeProductStatus({
      res,
      vendorId,
      itemId,
      body,
      currentVendorSubscription: vendorSub,
    });
  }

  @ApiOperation({ summary: 'Update the status of an item' })
  @ApiBearerAuth()
  @Roles(Role.STAFF, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('updateItemStatus/:itemId')
  async changeItemStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateItemStatus,
    @Param('itemId') itemId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.itemService.changeItemStatus({
      res,
      vendorId,
      itemId,
      body,
    });
  }

  @ApiOperation({ summary: 'Delete an item by ID' })
  @ApiBearerAuth()
  @Roles(Role.STAFF, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:itemId')
  async deleteItem(
    @Req() req: Request,
    @Res() res: Response,
    @Param('itemId') itemId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.itemService.deleteItem({ vendorId, itemId, res });
  }
}
