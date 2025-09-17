import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateServiceOptionDto } from './dto/createservice-option.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { UpdateServiceOptionDto } from './dto/updateservice-option.dto';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { Prisma, VendorCategoryType } from '@prisma/client';
import { GetServiceOptionQueryDto } from './dto/get-service-option.dto';
import { buildServiceOptionWhereFilter } from './utils/get-service-option.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { MetadataService } from 'src/metadata/metadata.service';

@Injectable()
export class ServiceOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly vendorTypeService: VendorTypeService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
  ) {}

  /*----- for admin ------*/
  async getAllServiceOption({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetServiceOptionQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();
    const where: Prisma.ServiceOptionWhereInput = buildServiceOptionWhereFilter(
      {
        query,
      },
    );

    const totalCount = await this.prisma.serviceOption.count({ where });

    const serviceOption = await this.prisma.serviceOption.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: [{ createdAt: 'asc' }, { vendorType: { type: 'desc' } }],
      include: {
        vendorType: true,
      },
    });

    const { name } = query;
    const queries = buildQueryParams({
      name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'service-option/getAll/admin',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: serviceOption,
      meta,
      message: 'Service Option retrieved successfully',
      statusCode: 200,
    });
  }

  async getServiceOptionByVendorTypeId({
    res,
    vendorTypeId,
  }: {
    res: Response;
    vendorTypeId: string;
  }) {
    const initialDate = new Date();
    const result = await this.prisma.serviceOption.findMany({
      where: {
        vendorTypeId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return this.response.successResponse({
      res,
      data: result,
      message: 'Service Options retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createServiceOption({
    res,
    body,
    serviceImage,
  }: {
    res: Response;
    body: CreateServiceOptionDto;
    serviceImage: Express.Multer.File;
  }) {
    const initialDate = new Date();
    const { name, vendorTypeId, description } = body;
    const vendorType =
      await this.vendorTypeService.findVendorTypeById(vendorTypeId);
    if (!vendorType || vendorType.type === VendorCategoryType.BANNER) {
      throw new NotFoundException(
        'Vendor Type is not found or VendorType has no service option creation',
      );
    }
    if (await this.findServiceOptionByNameAndVendorTypeId(name, vendorTypeId)) {
      throw new BadRequestException('Service option must be unique');
    }

    const { imageUrl, relativePath } =
      this.fileUploadService.handleSingleFileUpload({
        file: serviceImage,
        body: { type: ImageTypeEnum.SERVICEOPTION },
      });

    try {
      const result = await this.prisma.serviceOption.create({
        data: {
          name,
          vendorTypeId,
          description,
          serviceOptImageRef: imageUrl,
          relativeUrl: relativePath,
        },
      });

      return this.response.successResponse({
        res,
        data: result,
        message: 'ServiceOptions created Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(relativePath);
      throw err;
    }
  }

  async updateServiceOption({
    id,
    res,
    body,
    serviceImage,
  }: {
    id: string;
    res: Response;
    body: UpdateServiceOptionDto;
    serviceImage?: Express.Multer.File;
  }) {
    const initialDate = new Date();
    const { name, vendorTypeId, description } = body;
    if (!name && !description && !serviceImage) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const [serviceOption, vendorType] = await Promise.all([
      this.findServiceById(id),
      this.vendorTypeService.findVendorTypeById(vendorTypeId),
    ]);

    if (!serviceOption) {
      throw new NotFoundException('Service not found');
    }
    if (!vendorType) {
      throw new NotFoundException('Vendor type not found');
    }
    //checking uniqueness
    if (
      name &&
      (await this.findServiceOptionByNameAndVendorTypeId(
        name,
        vendorTypeId,
        id,
      ))
    ) {
      throw new BadRequestException('Service option must be unique');
    }
    //checking service option is in use
    if (name || description) {
      if (await this.findServiceUsage(id)) {
        throw new BadRequestException('Service option is in use');
      }
    }
    //file upload
    const uploadedImage = serviceImage
      ? this.fileUploadService.handleSingleFileUpload({
          file: serviceImage,
          body: { type: ImageTypeEnum.SERVICEOPTION },
        })
      : undefined;

    const updateQuery = {
      name: name ?? undefined,
      description: description ?? undefined,
      serviceOptImageRef: uploadedImage?.imageUrl ?? undefined,
      relativeUrl: uploadedImage?.relativePath ?? undefined,
    };

    try {
      const result = await this.prisma.serviceOption.update({
        where: { id },
        data: updateQuery,
      });

      if (uploadedImage && serviceOption.relativeUrl) {
        this.fileUploadService.handleSingleFileDeletion(
          serviceOption.relativeUrl,
        );
      }

      return this.response.successResponse({
        res,
        data: result,
        message: 'ServiceOptions updated Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      if (uploadedImage) {
        this.fileUploadService.handleSingleFileDeletion(
          uploadedImage?.relativePath,
        );
      }
      throw err;
    }
  }

  async deleteServiceOption({ res, id }: { res: Response; id: string }) {
    const initialDate = new Date();
    if (!(await this.findServiceById(id))) {
      throw new NotFoundException('Service not found');
    }
    if (await this.findServiceUsage(id)) {
      throw new BadRequestException('Service option is in use');
    }
    const result = await this.prisma.serviceOption.delete({
      where: { id },
    });

    return this.response.successResponse({
      res,
      data: result,
      message: 'ServiceOptions deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- Service Option -----*/
  async findServiceUsage(id: string) {
    return await this.prisma.vendorServiceOption.findFirst({
      where: { serviceOptionId: id },
      include: { vendor: true },
    });
  }

  async findServiceOptionByNameAndVendorTypeId(
    name: string,
    vendorTypeId: string,
    id?: string,
  ) {
    return await this.prisma.serviceOption.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        vendorTypeId,
        ...(id ? { id: { not: id } } : {}),
      },
    });
  }

  async getServiceOptionById(id: string) {
    const serviceOption = await this.prisma.serviceOption.findFirst({
      where: { id },
      include: {
        vendorType: true,
      },
    });
    return serviceOption;
  }

  async findServiceById(id: string) {
    return await this.prisma.serviceOption.findUnique({
      where: { id },
      include: {
        vendorType: true,
      },
    });
  }

  async findServiceOptionsByIdsAndVedorTypeId(
    serviceOptionIds: string[],
    vendorTypeId: string,
  ) {
    const serviceOptions = await this.prisma.serviceOption.count({
      where: {
        vendorTypeId,
        id: {
          in: serviceOptionIds,
        },
      },
    });
    return serviceOptions;
  }
}
