import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateVendorServiceDto } from './dto/create-vendor-service.dto';
import { createVendorServiceUtils } from './utils/create-vendor-service.utils';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ServiceOptionService } from 'src/service-option/service-option.service';
import { VendorService } from 'src/vendor/vendor.service';
import { UpdateVendorServiceDto } from './dto/update-vendor-service.dto';
import { updateVendorServiceUtils } from './utils/update-vendor-service.utils';
import { buildVendorServiceWhereFilter } from './utils/get-vendor-service.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { GetServiceQueryDto } from './dto/get-vendor-service-query.dto';

@Injectable()
export class VendorServiceService {
  constructor(
    private readonly metaDataService: MetadataService,
    private readonly responseService: ResponseService,
    private readonly fileUploadService: FileUploadService,
    private readonly serviceOptionService: ServiceOptionService,
    private readonly prisma: PrismaService,
    private readonly vendorService: VendorService,
  ) {}

  async getService({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetServiceQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const { where } = buildVendorServiceWhereFilter({
      query,
    });

    const totalCount = await this.prisma.service.count({ where });

    const serviceOptions = await this.prisma.service.findMany({
      where,
      include: {
        serviceImage: true,
        vendor: {
          include: {
            User: {
              select: {
                name: true,
                nameTamil: true,
              },
            },
            shopInfo: {
              include: {
                shopCategory: true,
                shopCity: true,
              },
            },
          },
        },
        vendorSubService: {
          include: {
            service: {
              include: {
                serviceOption: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    });

    const queries = buildQueryParams({
      name: query.name,
      keywordId: query.keywordId,
      status: query.status,
      vendorId: query.vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor-service',
      queries,
    });

    return this.responseService.successResponse({
      res,
      data: serviceOptions,
      meta,
      message: 'Vendor Sub Services retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createService({
    body,
    res,
    vendorId,
    images,
  }: {
    body: CreateVendorServiceDto;
    res: Response;
    vendorId: string;
    images: Express.Multer.File[];
  }) {
    const initialDate = new Date();

    const { imageUrls, createQuery } = await createVendorServiceUtils({
      body,
      vendorId,
      images,
      serviceOptionService: this.serviceOptionService,
      fileUploadService: this.fileUploadService,
      vendorServiceService: this,
      vendorService: this.vendorService,
    });

    try {
      const newVendorService = await this.prisma.service.create({
        data: createQuery,
        include: {
          serviceImage: true,
          vendorSubService: true,
        },
      });

      return this.responseService.successResponse({
        initialDate,
        res,
        message: 'Vendor Service created successfully',
        data: newVendorService,
        statusCode: 200,
      });
    } catch (err) {
      if (imageUrls) {
        for (const file of imageUrls.filePaths) {
          this.fileUploadService.handleSingleFileDeletion(file.relativePath);
        }
      }
      throw err;
    }
  }

  async updateService({
    res,
    body,
    images,
    vendorId,
    serviceId,
  }: {
    res: Response;
    body: UpdateVendorServiceDto;
    images: Express.Multer.File[];
    vendorId: string;
    serviceId: string;
  }) {
    const initialDate = new Date();

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    const { updateQuery, imageUrls, deletedServiceImages } =
      await updateVendorServiceUtils({
        body,
        vendorId,
        images,
        serviceOptionService: this.serviceOptionService,
        fileUploadService: this.fileUploadService,
        vendorServiceService: this,
        serviceId,
      });

    try {
      const updatedVendorService = await this.prisma.$transaction(
        async (tx) => {
          if (body.deletedServiceImageIds) {
            await tx.serviceImage.deleteMany({
              where: {
                id: {
                  in: body.deletedServiceImageIds,
                },
              },
            });
          }

          return await tx.service.update({
            where: {
              id: serviceId,
            },
            data: updateQuery,
            include: {
              serviceImage: true,
              vendorSubService: true,
            },
          });
        },
      );

      if (deletedServiceImages) {
        for (const fileItem of deletedServiceImages) {
          this.fileUploadService.handleSingleFileDeletion(fileItem.relativeUrl);
        }
      }

      return this.responseService.successResponse({
        initialDate,
        res,
        data: updatedVendorService,
        message: 'Service updated successfully',
        statusCode: 200,
      });
    } catch (err) {
      if (imageUrls) {
        for (const file of imageUrls.filePaths) {
          this.fileUploadService.handleSingleFileDeletion(file.relativePath);
        }
      }
      throw err;
    }
  }

  async deleteVendorService({
    vendorId,
    serviceId,
    res,
  }: {
    vendorId: string;
    serviceId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const service = await this.findServiceById(serviceId);
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    if (service.vendorId !== vendorId) {
      throw new BadRequestException('Service is not associated with vendor');
    }
    if (service.vendorSubService.length > 0) {
      throw new BadRequestException(
        'You cannot delete the service because a booking is associated with it. Instead, you can mark it as inactive.',
      );
    }

    const deletedService = await this.prisma.service.delete({
      where: {
        id: serviceId,
      },
      include: {
        serviceImage: true,
      },
    });

    if (deletedService.serviceImage.length > 0) {
      for (const fileItem of deletedService.serviceImage) {
        this.fileUploadService.handleSingleFileDeletion(fileItem.relativeUrl);
      }
    }

    return this.responseService.successResponse({
      res,
      initialDate,
      data: deletedService,
      message: 'Service deleted Successfully',
      statusCode: 200,
    });
  }

  /*----- helper func -----*/

  async findServiceByName({
    serviceOptId,
    name,
    vendorId,
  }: {
    serviceOptId: string;
    name: string;
    vendorId: string;
  }) {
    return await this.prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        serviceOptionId: serviceOptId,
        vendorId,
      },
    });
  }

  async findServiceById(id: string) {
    return await this.prisma.service.findUnique({
      where: {
        id,
      },
      include: {
        vendorSubService: {
          where: {
            serviceBooking: {
              some: {},
            },
          },
          take: 1,
        },
        serviceOption: true,
      },
    });
  }

  async findServiceImages(imageIds: string[]) {
    return await this.prisma.serviceImage.findMany({
      where: {
        id: {
          in: imageIds,
        },
      },
    });
  }

  async findSubServicesByServiceId(serviceId: string) {
    return await this.prisma.vendorSubService.findMany({
      where: {
        serviceId,
      },
    });
  }

  async checkVendorSubServicesForBooking(vendorSubServiceIds: string[]) {
    return await this.prisma.vendorSubService.findMany({
      where: {
        id: {
          in: vendorSubServiceIds,
        },
        service: {
          status: 'ACTIVE',
        },
      },
      include: {
        service: {
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
                User: true,
              },
            },
          },
        },
      },
    });
  }
}
