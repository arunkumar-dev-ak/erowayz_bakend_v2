import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShopInfoService } from './shop-info.service';
import { EditShopInfo } from './dto/editshopinfo.dto';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { ShopOpenCloseDto } from './dto/shopopenclose-dto';
import { FeaturePermission } from 'src/common/decorator/featurepermission.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateLicenseInfo } from './dto/updateLicenseInfo.dto';
import { extractVendorSubFromRequest } from 'src/common/functions/extact-sub';

@ApiTags('Shop Info') // Swagger grouping
@Controller('shop-info')
export class ShopInfoController {
  constructor(private readonly shopInfoService: ShopInfoService) {}

  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('getByVendorId/:id')
  @ApiOperation({
    summary: 'Get Shop Info by Vendor ID',
    description: 'Fetch shop details by vendor ID',
  })
  async getShopInfoByVendorId(@Req() req: Request, @Res() res: Response) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.shopInfoService.getShopInfoByVendorId({ res, id: vendorId });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Put('update/:id')
  @ApiOperation({
    summary: 'Update Shop Info',
    description: 'Update shop details by vendor ID',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shopImageRef', maxCount: 1 },
      { name: 'licenseImage', maxCount: 1 },
    ]),
  )
  @ApiParam({ name: 'id', type: String, description: 'Vendor ID' })
  @ApiBody({ type: EditShopInfo })
  async updateShopInfo(
    @Param('id') id: string,
    @Body() body: EditShopInfo,
    @Res() res: Response,
    @Req() req: Request,
    @UploadedFiles()
    files: {
      shopImageRef?: Express.Multer.File[];
      licenseImage?: Express.Multer.File[];
    },
  ) {
    const shopImage = files?.shopImageRef?.[0];
    const licenseImage = files?.licenseImage?.[0];
    const currentVendorSub = extractVendorSubFromRequest(req);
    await this.shopInfoService.updateShopInfo({
      id,
      res,
      body,
      shopImage,
      licenseImage,
      currentVendorSubscription: currentVendorSub,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Patch('updateLicenseStatus')
  async updatelicenseStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateLicenseInfo,
  ) {
    await this.shopInfoService.updateShopLicense({
      res,
      body,
    });
  }

  @Roles(Role.VENDOR, Role.STAFF)
  @FeaturePermission('openCloseStatus')
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Put('changeShopStatus')
  @ApiOperation({
    summary: 'Update Shop Status',
    description: 'Update shop details status by vendor ID',
  })
  @ApiBody({ type: ShopOpenCloseDto })
  async updateShopStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ShopOpenCloseDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);

    await this.shopInfoService.setShopOpenClose({
      res,
      body,
      vendorId,
    });
  }
}
