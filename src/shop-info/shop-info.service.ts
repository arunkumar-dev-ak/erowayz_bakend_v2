import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { EditShopInfo } from './dto/editshopinfo.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { ShopOpenCloseDto, ShopStatus } from './dto/shopopenclose-dto';
import { UpdateShopInfoUtils } from './utils/update-shop-info.utils';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Status, VendorCategoryType, VendorSubscription } from '@prisma/client';
import { UpdateLicenseInfo } from './dto/updateLicenseInfo.dto';
import { ApprovedOrPendingMap } from 'src/vendor/dto/get-vendor-admin-query.dto';
import { LicenseCategoryService } from 'src/license-category/license-category.service';
import { ShopCategoryService } from 'src/shop-category/shop-category.service';
import { CityService } from 'src/city/city.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
// import { UpdateLicenseInfo } from './dto/updateLicenseInfo.dto';

@Injectable()
export class ShopInfoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly fileUploadService: FileUploadService,
    private readonly licenseCategoryService: LicenseCategoryService,
    private readonly shopCategoryService: ShopCategoryService,
    private readonly shopCityService: CityService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {}

  async getShopInfoByVendorId({ res, id }: { res: Response; id: string }) {
    const initialDate = new Date();
    const shopInfo = await this.prisma.shopInfo.findFirst({
      where: { vendorId: id },
      include: {
        license: true,
      },
    });
    return this.response.successResponse({
      res,
      data: shopInfo,
      message: 'ShopInfo fetched successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateShopInfo({
    id,
    res,
    body,
    shopImage,
    licenseImage,
    currentVendorSubscription,
  }: {
    id: string;
    res: Response;
    body: EditShopInfo;
    shopImage?: Express.Multer.File;
    licenseImage?: Express.Multer.File;
    currentVendorSubscription: VendorSubscription;
  }) {
    const initialDate = new Date();

    // Check if shop exists
    const existingShop = await this.findShopById({ id });
    if (!existingShop) {
      throw new NotFoundException('Shop not found');
    }

    if (
      (!body || Object.keys(body).length === 0) &&
      !shopImage &&
      !licenseImage
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    if (body.shopCategoryId) {
      const vendorCategoryType = existingShop.vendor.vendorType.type;
      if (vendorCategoryType !== VendorCategoryType.PRODUCT) {
        throw new BadRequestException(
          `Shop type is required only when the vendor category is Street Food`,
        );
      }
    }

    //checking shopType
    if (body.shopCategoryId) {
      if (existingShop.vendor.vendorType.type !== VendorCategoryType.PRODUCT) {
        throw new BadRequestException(
          'Shop type is required only when the vendor category is Street Food,',
        );
      }
      const existingShopCategory =
        await this.shopCategoryService.getShopCategoryByIdAndVendorType({
          id: body.shopCategoryId,
          vendorTypeId: existingShop.vendor.vendorTypeId,
        });

      if (
        !existingShopCategory ||
        existingShopCategory.status === Status.INACTIVE
      ) {
        throw new BadRequestException(
          'Shop Category not found or it is inactive',
        );
      }
    }

    if (body.shopCityId) {
      const city = await this.shopCityService.getCityById(body.shopCityId);
      if (!city || city.status === Status.INACTIVE) {
        throw new BadRequestException('City not found or it is inactive');
      }
    }

    //check licenseNo
    if (body.licenseNo) {
      const existingLicenseWithNo = await this.checkLicenseByNo(body.licenseNo);

      if (existingLicenseWithNo) {
        //check license belong to same vendor
        const currentVendorLicenseNo = existingShop.license?.id;
        if (!currentVendorLicenseNo) {
          throw new BadRequestException(
            'License already used by another vendor',
          );
        }

        if (currentVendorLicenseNo !== existingLicenseWithNo.id) {
          throw new BadRequestException(
            'License already used by another vendor',
          );
        }
      }
    }

    const {
      shopInfoData,
      licenseUpdate,
      shopImageUrl,
      licenseImageUrl,
      updateVendorUsageQuery,
    } = await UpdateShopInfoUtils({
      body,
      shopImage,
      licenseImage,
      fileUploadService: this.fileUploadService,
      license: existingShop.license,
      licenseCategoryService: this.licenseCategoryService,
      shopId: id,
      vendorSubscriptionService: this.vendorSubscriptionService,
      currentVendorSubscription,
    });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        if (body.latitude || body.longitude) {
          const updatingLatitude = body.latitude ?? existingShop.latitude;
          const updatingLongitude = body.longitude ?? existingShop.longitude;

          await tx.$executeRaw`
          UPDATE "ShopInfo"
          SET "location" = ST_SetSRID(ST_MakePoint(${updatingLongitude}, ${updatingLatitude}), 4326)::geography
          WHERE "id" = ${id}
        `;
        }

        if (updateVendorUsageQuery) {
          await tx.vendorFeatureUsage.update(updateVendorUsageQuery);
        }

        return await tx.shopInfo.update({
          where: { id },
          data: {
            ...shopInfoData,
            ...(licenseUpdate ? { license: licenseUpdate } : {}),
          },
          include: {
            license: true,
          },
        });
      });

      //delete old images
      if (shopImageUrl && existingShop.relativeUrl) {
        this.fileUploadService.handleSingleFileDeletion(
          existingShop.relativeUrl,
        );
      }
      if (licenseImageUrl && existingShop.license?.relativeUrl) {
        this.fileUploadService.handleSingleFileDeletion(
          existingShop.license.relativeUrl,
        );
      }

      return this.response.successResponse({
        res,
        data: result,
        message: 'ShopInfo updated successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      for (const fileItem of [shopImageUrl, licenseImageUrl]) {
        if (fileItem) {
          this.fileUploadService.handleSingleFileDeletion(
            fileItem.relativePath,
          );
        }
      }
      throw err;
    }
  }

  async setShopOpenClose({
    res,
    body,
    vendorId,
  }: {
    res: Response;
    body: ShopOpenCloseDto;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const newStatus = body.isShopOpen === ShopStatus.OPEN ? true : false;

    const shopInfo = await this.findShopByVendor(vendorId);

    if (!shopInfo) {
      throw new BadRequestException(
        'Shop details not found or not associate with vendor',
      );
    }

    if (newStatus === shopInfo.isShopOpen) {
      throw new BadRequestException(
        `Shop is already ${shopInfo.isShopOpen ? 'open' : 'closed'}`,
      );
    }
    if (newStatus === false) {
      const orderItem = await this.prisma.orderItem.findFirst({
        where: {
          orderItemVendorServiceOption: {
            some: {
              vendorServiceOption: {
                vendorId,
              },
            },
          },
          order: {
            orderStatus: {
              notIn: ['DELIVERED', 'CANCELLED'],
            },
          },
        },
      });

      if (orderItem) {
        throw new BadRequestException(
          'You cannot close the shop because there are orders that are not yet delivered or cancelled.',
        );
      }
    }

    const updatedShopInfo = await this.prisma.shopInfo.update({
      where: {
        id: shopInfo.id,
      },
      data: {
        isShopOpen: newStatus,
      },
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: updatedShopInfo,
      message: 'Shop status updated successfully',
      statusCode: 200,
    });
  }

  async updateShopLicense({
    res,
    body,
  }: {
    res: Response;
    body: UpdateLicenseInfo;
  }) {
    const initialDate = new Date();

    const { licenseId, isLicenseApproved } = body;
    const existingLicense = await this.checkLicenseById(licenseId);
    if (!existingLicense) {
      throw new BadRequestException('License not found');
    }

    const updatedLicense = await this.prisma.license.update({
      where: {
        id: licenseId,
      },
      data: {
        isLicenseApproved: ApprovedOrPendingMap[isLicenseApproved],
      },
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: updatedLicense,
      message: 'License updated successfully',
      statusCode: 200,
    });
  }

  /*----- hepler func -----*/
  async findShopById({ id }: { id: string }) {
    const shopInfo = await this.prisma.shopInfo.findUnique({
      where: { id },
      include: {
        license: true,
        vendor: {
          include: {
            vendorType: true,
          },
        },
      },
    });
    return shopInfo;
  }

  async findShopByVendor(vendorId: string) {
    return await this.prisma.shopInfo.findUnique({
      where: {
        vendorId,
      },
      include: {
        vendor: true,
      },
    });
  }

  async checkLicenseById(licenseId: string) {
    return await this.prisma.license.findUnique({ where: { id: licenseId } });
  }

  async checkLicenseByNo(licenseNo: string) {
    return await this.prisma.license.findUnique({
      where: {
        licenseNo,
      },
    });
  }
}
