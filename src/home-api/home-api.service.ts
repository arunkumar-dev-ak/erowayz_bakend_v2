import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { HomeApiDto } from './dto/home-api.dto';
import { OrderPaymentType } from '@prisma/client';
import { getIstTimeRange } from 'src/subscription/utils/get-sub-transaction.utils';

@Injectable()
export class HomeApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getBarChartData({
    vendorId,
    res,
    body,
  }: {
    vendorId: string;
    res: Response;
    body: HomeApiDto;
  }) {
    const initialDate = new Date();

    const { startDateTime, endDateTime } = body;

    const start = getIstTimeRange(new Date(startDateTime)).startIst;
    const end = getIstTimeRange(new Date(endDateTime)).endIst;

    //total orders
    const totalOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        orderItems: {
          some: {
            item: {
              vendorId: vendorId,
            },
          },
        },
        orderPayment: {
          isNot: null,
        },
      },
    });

    //service options
    const serviceOptionCounts =
      await this.prisma.orderItemVendorServiceOption.groupBy({
        by: ['vendorServiceOptionId'],
        _count: {
          vendorServiceOptionId: true,
        },
        where: {
          orderItem: {
            order: {
              createdAt: {
                gte: start,
                lte: end,
              },
              orderPayment: {
                isNot: null,
              },
            },
          },
          vendorServiceOption: {
            vendorId: vendorId,
          },
        },
      });

    const serviceOptionNames = await this.prisma.vendorServiceOption.findMany({
      select: {
        id: true,
        serviceOption: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        vendorId: vendorId,
        id: {
          in: serviceOptionCounts.map((item) => item.vendorServiceOptionId),
        },
      },
    });

    //Cash
    const totalOrdersByCash = await this.prisma.order.count({
      where: {
        orderPayment: {
          type: OrderPaymentType.CASH,
        },
        orderItems: {
          some: {
            item: {
              vendorId: vendorId,
            },
          },
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // JUSPAY payment method
    const totalOrdersByJuspay = await this.prisma.order.count({
      where: {
        orderPayment: {
          type: OrderPaymentType.JUSPAY,
        },
        orderItems: {
          some: {
            item: {
              vendorId: vendorId,
            },
          },
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const totalOrdersByCoins = await this.prisma.order.count({
      where: {
        orderPayment: {
          type: OrderPaymentType.COINS,
        },
        orderItems: {
          some: {
            item: {
              vendorId: vendorId,
            },
          },
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const result = {
      totalOrders: totalOrdersCount,
      ordersByServiceOption: serviceOptionCounts.map((item) => {
        const matchedOption = serviceOptionNames.find(
          (option) => option.id === item.vendorServiceOptionId,
        );

        const serviceOptionId = matchedOption?.serviceOption.id ?? '';
        const serviceOptionName =
          matchedOption?.serviceOption.name ?? 'Unknown';

        return {
          serviceOptionId,
          serviceOptionName,
          orderCount: item._count.vendorServiceOptionId,
        };
      }),
      ordersByPaymentMethod: {
        CASH: totalOrdersByCash,
        JUSPAY: totalOrdersByJuspay,
        COINS: totalOrdersByCoins,
      },
    };

    return this.responseService.successResponse({
      initialDate,
      res,
      message: 'BarChart fetched Successfully',
      data: result,
      statusCode: 201,
    });
  }
}
