import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { HomeApiDto } from './dto/home-api.dto';
import { OrderPaymentType } from '@prisma/client';

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

    console.log(startDateTime);
    console.log(endDateTime);

    //total orders
    const totalOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startDateTime,
          lte: endDateTime,
        },
        orderItems: {
          some: {
            item: {
              vendorId: vendorId,
            },
          },
        },
      },
    });

    //service options
    const serviceOptionCounts =
      await this.prisma.orderItemVendorServiceOption.groupBy({
        by: ['vendorServiceOptionId'],
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: startDateTime,
            lte: endDateTime,
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
          // paymentMethod: 'CASH',
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
          gte: startDateTime,
          lte: endDateTime,
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
          gte: startDateTime,
          lte: endDateTime,
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
          orderCount: item._count.id,
        };
      }),
      ordersByPaymentMethod: {
        CASH: totalOrdersByCash,
        JUSPAY: totalOrdersByJuspay,
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
