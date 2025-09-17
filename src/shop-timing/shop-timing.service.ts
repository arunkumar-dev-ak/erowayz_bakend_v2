import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { ShopInfoService } from 'src/shop-info/shop-info.service';
import { ShopTimingDto } from './dto/shop-timing.dto';
import {
  createdOpenAndCloseTime,
  createShopTimingUtils,
} from './utils/create-shop-timing.utils';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';
import { UpdateShopTimingUtils } from './utils/update-shop-timing.utils';

@Injectable()
export class ShopTimingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly shopInfoService: ShopInfoService,
  ) {}

  async getShopTimingByVendor({
    res,
    vendorId,
  }: {
    res: Response;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const shopTiming = await this.prisma.shopWorkingHour.findMany({
      where: {
        shop: {
          vendorId,
        },
      },
    });

    return await this.responseService.successResponse({
      res,
      initialDate,
      data: shopTiming,
      message: 'ShopTiming retrieved successfully',
      statusCode: 200,
    });
  }

  async createShopTiming({
    res,
    vendorId,
    body,
  }: {
    res: Response;
    vendorId: string;
    body: ShopTimingDto;
  }) {
    const initialDate = new Date();

    const { shopInfo } = await createShopTimingUtils({
      vendorId,
      shopInfoService: this.shopInfoService,
    });

    const entries = body.timings.map((timing) => ({
      shopId: shopInfo.id,
      dayOfWeek: timing.dayOfWeek,
      isClosed: timing.isClosed,
      openTime:
        !timing.isClosed && timing.openTime
          ? createdOpenAndCloseTime(timing.openTime)
          : null,
      closeTime:
        !timing.isClosed && timing.closeTime
          ? createdOpenAndCloseTime(timing.closeTime)
          : null,
      area: timing.area,
    }));

    // Use Prisma transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      await tx.shopWorkingHour.deleteMany({
        where: { shopId: shopInfo.id },
      });
      return tx.shopWorkingHour.createMany({
        data: entries,
      });
    });

    const result = await this.prisma.shopWorkingHour.findMany({
      where: {
        shopId: shopInfo.id,
      },
    });

    return this.responseService.successResponse({
      res,
      message: 'Shop timings saved successfully',
      data: result,
      statusCode: 201,
      initialDate,
    });
  }

  async updateShopTimingStatus({
    res,
    shopTimingId,
    vendorId,
    body,
  }: {
    res: Response;
    shopTimingId: string;
    vendorId: string;
    body: UpdateShopTimingUtils;
  }) {
    const initialDate = new Date();

    const shopTiming = await this.shopTimingByVendor(shopTimingId, vendorId);
    if (!shopTiming) {
      throw new BadRequestException(
        'ShopTiming not found or not associated with vendor',
      );
    }

    const updatedShopTiming = await this.prisma.shopWorkingHour.update({
      where: {
        id: shopTimingId,
      },
      data: {
        isClosed: TrueOrFalseMap[body.isClosed],
      },
    });

    return this.responseService.successResponse({
      res,
      initialDate,
      data: updatedShopTiming,
      statusCode: 201,
      message: 'Status Updated successfully',
    });
  }

  async deleteShopTiming({
    res,
    vendorId,
  }: {
    res: Response;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const shopTiming = await this.checkShopTimingByVendorId(vendorId);
    if (!shopTiming) {
      throw new BadRequestException('ShopTiming does not exists');
    }

    const deletedShopTiming = await this.prisma.shopWorkingHour.deleteMany({
      where: {
        shop: {
          vendorId,
        },
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: deletedShopTiming,
      statusCode: 200,
      message: 'ShopTiming deleted successfully',
    });
  }

  /*----- helper func -----*/
  async getShopTimingByShop(shopId: string) {
    return await this.prisma.shopWorkingHour.findFirst({
      where: {
        shopId,
      },
    });
  }

  async shopTimingByVendor(shopTimingId: string, vendorId: string) {
    return await this.prisma.shopWorkingHour.findFirst({
      where: {
        id: shopTimingId,
        shop: {
          vendorId,
        },
      },
    });
  }

  async checkShopTimingByVendorId(vendorId: string) {
    return await this.prisma.shopWorkingHour.findFirst({
      where: {
        shop: {
          vendorId,
        },
      },
    });
  }
}
