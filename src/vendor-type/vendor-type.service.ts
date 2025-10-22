import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateVendorTypeDto } from './dto/createvendortype.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { UpdateVendorTypeDto } from './dto/updatevendortype.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { updateVendorTypeUtils } from './utils/update-vendor-type.utils';
import { GetVendorTypeQueryDto } from './dto/get-vendor-type.dto';
import { buildVendorTypeWhereFilter } from './utils/get-vendor-type.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { MetadataService } from 'src/metadata/metadata.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VendorTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getAllVendorType({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetVendorTypeQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();
    const where: Prisma.VendorTypeWhereInput = buildVendorTypeWhereFilter({
      query,
    });

    const totalCount = await this.prisma.vendorType.count({ where });

    const vendorTypes = await this.prisma.vendorType.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'asc',
      },
      include: { serviceOptions: true },
    });

    const { name } = query;
    const queries = buildQueryParams({
      name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor-type/getAll',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: vendorTypes,
      meta,
      message: 'VendorType retrieved successfully',
      statusCode: 200,
    });
  }

  async createVendorType({
    userId,
    res,
    body,
    imageRef,
  }: {
    userId: string;
    res: Response;
    body: CreateVendorTypeDto;
    imageRef: Express.Multer.File;
  }) {
    const initialDate = new Date();
    //check if vendor type exists with the same name
    if (await this.findVendorTypeByName(body.name)) {
      throw new BadRequestException('Vendor name must be unique');
    }
    //uploadImage
    const { imageUrl, relativePath } =
      this.fileUploadService.handleSingleFileUpload({
        file: imageRef,
        body: { type: ImageTypeEnum.VENDORTYPE },
      });
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        return await tx.vendorType.create({
          data: {
            creatorId: userId,
            name: body.name,
            imageRef: imageUrl,
            relativeUrl: relativePath,
            type: body.type,
            tamilName: body.tamilName,
          },
        });
      });
      return this.response.successResponse({
        res,
        data: result,
        message: 'Vendor generated successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(relativePath);
      throw err;
    }
  }

  async updateVendorType({
    id,
    res,
    body,
    image,
  }: {
    id: string;
    res: Response;
    body: UpdateVendorTypeDto;
    image?: Express.Multer.File;
  }) {
    const initialDate = new Date();
    const { name, type, tamilName } = body;

    if (!name && !type && !tamilName && !image) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const { existingVendorType } = await updateVendorTypeUtils({
      body,
      id,
      vendorTypeService: this,
    });

    //file upload
    const uploadedImage = image
      ? this.fileUploadService.handleSingleFileUpload({
          file: image,
          body: { type: ImageTypeEnum.VENDORTYPE },
        })
      : undefined;

    const updateQuery = {
      name: name ?? undefined,
      type: type ?? undefined,
      imageRef: uploadedImage?.imageUrl ?? undefined,
      relativeUrl: uploadedImage?.relativePath ?? undefined,
      tamilName: tamilName ?? undefined,
    };

    try {
      const updatedVendor = await this.prisma.vendorType.update({
        where: { id },
        data: updateQuery,
      });

      if (uploadedImage && existingVendorType.relativeUrl) {
        this.fileUploadService.handleSingleFileDeletion(
          existingVendorType.relativeUrl,
        );
      }

      return this.response.successResponse({
        res,
        data: updatedVendor,
        message: 'VendorType updated successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      if (uploadedImage) {
        this.fileUploadService.handleSingleFileDeletion(
          uploadedImage?.relativePath ?? existingVendorType.relativeUrl,
        );
      }
      throw err;
    }
  }

  async deleteVendorType({ res, id }: { res: Response; id: string }) {
    const initialDate = new Date();
    const existingVendorType = await this.findVendorTypeById(id);
    if (!existingVendorType) {
      throw new NotFoundException('Vendor not found');
    }

    if ((existingVendorType.vendor?.length ?? 0) > 0) {
      throw new BadRequestException(
        'Vendor type cannot be deleted because it has associated vendors',
      );
    }

    const result = await this.prisma.vendorType.delete({
      where: { id },
    });

    return this.response.successResponse({
      res,
      data: result,
      message: 'VendorType deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*-----helper func -----*/
  async findVendorTypeByName(name: string, id?: string) {
    return this.prisma.vendorType.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        id: id ? { not: id } : undefined,
      },
    });
  }

  async findVendorTypeById(id: string) {
    return this.prisma.vendorType.findUnique({
      where: { id },
      include: {
        vendor: {
          where: {
            service: {
              some: {},
            },
          },
        },
        category: true,
        serviceOptions: true,
      },
    });
  }

  async findServiceCountOnVendorType({
    serviceOptionIds,
    vendorTypeId,
  }: {
    serviceOptionIds: Array<string>;
    vendorTypeId: string;
  }) {
    const count = await this.prisma.serviceOption.count({
      where: {
        vendorTypeId,
        id: { in: serviceOptionIds },
      },
    });
    return count;
  }

  async findVendorTypeByServiceId(id: string) {
    const vendorType = await this.prisma.vendorType.findFirst({
      where: {
        serviceOptions: { some: { id } },
      },
      include: {
        serviceOptions: true,
      },
    });
    return vendorType;
  }
}
