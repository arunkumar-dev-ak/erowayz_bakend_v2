import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { OrderService } from 'src/order/order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { UserService } from 'src/user/user.service';
import { VendorService } from 'src/vendor/vendor.service';
import { CreateFavouriteCustomerForVendorDto } from './dto/create-favourite-customer.dto';
import { createFavouriteCustomerForVendorUtils } from './utils/create-fav-customer.utils';
import { CreateFavouriteVendorForCustomerDto } from './dto/create-favourite-vendor.dto';
import { GetFavouriteVendorQueryDto } from './dto/get-favourite-vendor-query.dto';
import { Prisma } from '@prisma/client';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { GetFavouriteCustomerQueryDto } from './dto/get-favourite-customer-query.dto';

@Injectable()
export class FavouriteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly orderService: OrderService,
    private readonly vendorService: VendorService,
    private readonly userService: UserService,
  ) {}

  /*----- customer side -----*/
  async getFavouriteVendorForCustomer({
    res,
    query,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    query: GetFavouriteVendorQueryDto;
    offset: number;
    limit: number;
    userId: string;
  }) {
    const initialDate = new Date();

    const { shopName } = query;

    const where: Prisma.FavouriteVendorForCustomerWhereInput = {
      userId,
    };
    if (shopName) {
      where.vendor = {
        shopInfo: {
          name: {
            contains: shopName,
            mode: 'insensitive',
          },
        },
      };
    }

    const totalCount = await this.prisma.favouriteVendorForCustomer.count({
      where,
    });

    const favourite = await this.prisma.favouriteVendorForCustomer.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendor: {
          include: {
            shopInfo: true,
          },
        },
      },
    });

    const queries = buildQueryParams({
      shopName: query.shopName,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'favourite/customer',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: favourite,
      meta,
      message: 'favourite retrieved successfully',
      statusCode: 200,
    });
  }

  async createFavouriteVendorForCustomer({
    res,
    body,
    userId,
  }: {
    res: Response;
    body: CreateFavouriteVendorForCustomerDto;
    userId: string;
  }) {
    const initialDate = new Date();

    const { vendorId } = body;
    const [vendor, alreadyExistingVendor] = await Promise.all([
      this.vendorService.findVendorByVendorId(vendorId),
      this.checkVendorUnderFavourite(userId, vendorId),
    ]);

    if (!vendor) {
      throw new BadRequestException('Vendor not found');
    }
    if (alreadyExistingVendor) {
      throw new BadRequestException(`Vendor Already exists under favourite`);
    }

    const favourite = await this.prisma.favouriteVendorForCustomer.create({
      data: {
        userId,
        vendorId,
      },
      include: {
        user: true,
        vendor: true,
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: favourite,
      message: 'Favourite Added Successfully',
      statusCode: 200,
    });
  }

  async removeFavouriteVendorForCustomer({
    res,
    userId,
    favouriteId,
  }: {
    res: Response;
    userId: string;
    favouriteId: string;
  }) {
    const initialDate = new Date();
    const favourite = await this.getFavouriteVendorForCustomerById(favouriteId);

    if (!favourite) {
      throw new BadRequestException('Favourite not found');
    }
    if (favourite.userId !== userId) {
      throw new BadRequestException('User Not matches on the Favourite');
    }

    const removedFavourite =
      await this.prisma.favouriteVendorForCustomer.delete({
        where: {
          id: favouriteId,
        },
      });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: removedFavourite,
      message: 'Favourite Removed Successfully',
      statusCode: 200,
    });
  }

  /*----- vendor side -----*/
  async getFavouriteCustomerForVendor({
    res,
    query,
    offset,
    limit,
    vendorId,
  }: {
    res: Response;
    query: GetFavouriteCustomerQueryDto;
    offset: number;
    limit: number;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const { name } = query;

    const where: Prisma.FavouriteCustomerForVendorWhereInput = {
      vendorId,
    };
    if (name) {
      where.user = {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      };
    }

    const totalCount = await this.prisma.favouriteCustomerForVendor.count({
      where,
    });

    const favourite = await this.prisma.favouriteCustomerForVendor.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        user: true,
        vendor: true,
      },
    });

    const queries = buildQueryParams({
      name: query.name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'favourite/vendor',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: favourite,
      meta,
      message: 'favourite retrieved successfully',
      statusCode: 200,
    });
  }

  async createFavouriteCustomerForVendor({
    res,
    vendorId,
    body,
  }: {
    res: Response;
    vendorId: string;
    body: CreateFavouriteCustomerForVendorDto;
  }) {
    const initialDate = new Date();

    const { createQuery } = await createFavouriteCustomerForVendorUtils({
      body,
      vendorId,
      favouriteService: this,
      orderService: this.orderService,
    });

    const favourite = await this.prisma.favouriteCustomerForVendor.create({
      data: createQuery,
      include: {
        user: true,
        vendor: true,
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: favourite,
      message: 'Favourite Added Successfully',
      statusCode: 200,
    });
  }

  async removeFavouriteCustomerForVendor({
    res,
    vendorId,
    favouriteId,
  }: {
    res: Response;
    vendorId: string;
    favouriteId: string;
  }) {
    const initialDate = new Date();
    const favourite = await this.getFavouriteCustomerForVendorById(favouriteId);

    if (!favourite) {
      throw new BadRequestException('Favourite not found');
    }
    if (favourite.vendorId !== vendorId) {
      throw new BadRequestException('Vendor Not matches on the Favourite');
    }

    const removedFavourite =
      await this.prisma.favouriteCustomerForVendor.delete({
        where: {
          id: favouriteId,
        },
      });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: removedFavourite,
      message: 'Favourite Removed Successfully',
      statusCode: 200,
    });
  }

  /*----  helperfunc -----*/
  async getBookingById(bookingId: string) {
    return this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        serviceBooking: {
          include: {
            vendorSubService: {
              include: {
                service: true,
              },
            },
          },
          take: 1,
        },
        bannerBooking: true,
      },
    });
  }

  async getFavouriteVendorForCustomerById(id: string) {
    return await this.prisma.favouriteVendorForCustomer.findUnique({
      where: {
        id,
      },
    });
  }

  async getFavouriteCustomerForVendorById(id: string) {
    return await this.prisma.favouriteCustomerForVendor.findUnique({
      where: {
        id,
      },
    });
  }

  async checkCustomerUnderFavourite(userId: string, vendorId: string) {
    return await this.prisma.favouriteCustomerForVendor.findUnique({
      where: {
        userId_vendorId: {
          userId,
          vendorId,
        },
      },
    });
  }

  async checkVendorUnderFavourite(userId: string, vendorId: string) {
    return await this.prisma.favouriteVendorForCustomer.findUnique({
      where: {
        userId_vendorId: {
          userId,
          vendorId,
        },
      },
    });
  }
}
