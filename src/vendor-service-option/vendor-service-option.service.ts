import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { Status } from '@prisma/client';
import { ServiceOptionService } from 'src/service-option/service-option.service';
import { VendorService } from 'src/vendor/vendor.service';
import { GetVendorServiceQueryDto } from './dto/get-vendor-service-query.dto';
import { buildCustomerVendorOptionWhereFilter } from './utils/get-customert-vendoroption.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class VendorServiceOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaData: MetadataService,
    private readonly serviceOption: ServiceOptionService,
    private readonly vendorService: VendorService,
  ) {}

  /*----- All -----*/
  async getServiceOptionForCustomer({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetVendorServiceQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildCustomerVendorOptionWhereFilter({
      query,
    });

    const totalCount = await this.prisma.vendorServiceOption.count({ where });

    const vendorServiceOption = await this.prisma.vendorServiceOption.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        serviceOption: true,
        vendor: {
          include: {
            shopInfo: {
              include: {
                shopCategory: true,
                shopCity: true,
              },
            },
          },
        },
      },
    });

    const queries = buildQueryParams({
      serviceId: query.serviceId,
      subServiceId: query.subServiceId,
      name: query.name,
      subServiceName: query.subServiceName,
      status: query.status,
      vendorId: query.vendorId,
    });

    const meta = this.metaData.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor-service-option',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: vendorServiceOption,
      meta,
      message: 'Vendor Service Option retrieved successfully',
      statusCode: 200,
    });
  }

  async getServiceOptionByVendor({
    vendorId,
    res,
    offset,
    limit,
  }: {
    vendorId: string;
    res: Response;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();
    const totalCount = await this.prisma.vendorServiceOption.count({
      where: {
        vendorId,
      },
    });
    const result = await this.prisma.vendorServiceOption.findMany({
      where: {
        vendorId,
      },
      include: {
        serviceOption: true,
      },
      take: limit,
      skip: offset,
    });

    const meta = this.metaData.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'serviceByVendor',
    });

    return this.response.successResponse({
      res,
      data: result,
      meta,
      message: 'Service options fetched successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper function -----*/
  async getVendorServiceOption(id: string) {
    const vendorServiceOption =
      await this.prisma.vendorServiceOption.findUnique({
        where: { id },
        include: {
          serviceOption: true,
        },
      });
    return vendorServiceOption;
  }

  async addServiceOptionForVendor({
    res,
    serviceOptionId,
    vendorId,
  }: {
    res: Response;
    serviceOptionId: string;
    vendorId: string;
  }) {
    const initialDate = new Date();

    //check vendorServiceOption is applicable for vendor
    const [serviceOption, vendor] = await Promise.all([
      this.serviceOption.getServiceOptionById(serviceOptionId),
      this.vendorService.findVendorByVendorId(vendorId),
    ]);
    if (!serviceOption || serviceOption.status == 'INACTIVE') {
      throw new BadRequestException('Service Option not found');
    } else if (!vendor) {
      throw new BadRequestException('Vendor not found');
    } else if (serviceOption.vendorTypeId !== vendor.vendorTypeId) {
      throw new BadRequestException(
        `${serviceOption.name} is not associate with the ${serviceOption.vendorType.name}`,
      );
    }

    const vendorServiceOpt = await this.prisma.vendorServiceOption.upsert({
      where: {
        vendorId_serviceOptionId: {
          vendorId,
          serviceOptionId,
        },
      },
      create: {
        vendorId,
        serviceOptionId,
      },
      update: {
        status: Status.ACTIVE,
      },
    });

    return this.response.successResponse({
      initialDate,
      data: vendorServiceOpt,
      message: 'Vendor Service option added successfully',
      res,
      statusCode: 200,
    });
  }

  async removeServiceOptionForVendor({
    res,
    vendorId,
    vendorServiceOptId,
  }: {
    res: Response;
    vendorId: string;
    vendorServiceOptId: string;
  }) {
    const initialDate = new Date();
    const [totalVendorServiceOption, vendorServiceOption] = await Promise.all([
      this.prisma.vendorServiceOption.count({
        where: {
          vendorId,
          status: Status.ACTIVE,
        },
      }),
      this.prisma.vendorServiceOption.findFirst({
        where: {
          id: vendorServiceOptId,
          vendorId,
          status: Status.ACTIVE,
        },
        include: {
          orderItemVendorServiceOption: {
            include: {
              orderItem: true,
            },
          },
        },
      }),
    ]);

    if (!vendorServiceOption) {
      throw new BadRequestException(
        'Service Option is not associated with vendor',
      );
    }

    if (totalVendorServiceOption <= 1) {
      throw new BadRequestException(
        'Atleast one of the service is required for the vendor',
      );
    }

    let removedServiceOption;

    if (vendorServiceOption.orderItemVendorServiceOption.length > 0) {
      //Service Options in cart.So make Inactive
      removedServiceOption = await this.prisma.vendorServiceOption.update({
        where: {
          id: vendorServiceOption.id,
        },
        data: {
          status: Status.INACTIVE,
        },
      });
    } else {
      removedServiceOption = await this.prisma.vendorServiceOption.delete({
        where: {
          id: vendorServiceOption.id,
        },
      });
    }

    return this.response.successResponse({
      initialDate,
      res,
      message: 'Item Removed Successfully',
      statusCode: 200,
      data: removedServiceOption,
    });
  }

  async getVendorServiceOptions({
    vendorId,
    vendorServicesIds,
  }: {
    vendorId: string;
    vendorServicesIds: string[];
  }) {
    return this.prisma.vendorServiceOption.findMany({
      where: {
        vendorId,
        id: {
          in: vendorServicesIds,
        },
        status: 'ACTIVE',
      },
      include: {
        vendor: true,
      },
    });
  }

  async findVendorServiceOptionById(id: string) {
    return await this.prisma.vendorServiceOption.findUnique({
      where: {
        id,
      },
    });
  }
}
