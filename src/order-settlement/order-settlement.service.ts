import { BadRequestException, Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetOrderSettlementQueryDto } from './dto/get-order-settlement';
import { buildOrderSettlementWhereFilter } from './utils/get-order-settlement.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { CreateOrderSettlementDto } from './dto/create-order-settlement';
import { CreateOrderSettlementUtils } from './utils/create-order-settlement.utils';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { VendorService } from 'src/vendor/vendor.service';
import { Response } from 'express';
import { UpdateOrderSettlementDto } from './dto/update-order-settlement';
import { UpdateOrderSettlementUtils } from './utils/update-order-settlement.utils';
import { DeleteOrderSettlementUtils } from './utils/delete-order-settlement.utils';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';

@Injectable()
export class OrderSettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly responseService: ResponseService,
    private readonly fileUploadService: FileUploadService,
    private readonly vendorService: VendorService,
  ) {}

  async getOrderSettlement({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetOrderSettlementQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const { where } = buildOrderSettlementWhereFilter({
      query,
    });

    const totalCount = await this.prisma.orderSettlement.count({
      where,
    });

    const orderSettlements = await this.prisma.orderSettlement.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderSettlementFile: true,
      },
    });

    const { vendorName, startDate, endDate, shopName, id, vendorId } = query;

    const queries = buildQueryParams({
      vendorName,
      startDate,
      endDate,
      shopName,
      id,
      vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'orderSettlement',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: orderSettlements,
      meta,
      message: 'OrderSettlements retrieved successfully',
      statusCode: 200,
    });
  }

  async createOrderSettlement({
    body,
    res,
  }: {
    body: CreateOrderSettlementDto;
    res: Response;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery } = await CreateOrderSettlementUtils({
      body,
      vendorService: this.vendorService,
      orderSettlementService: this,
    });

    const newOrderSettlement = await this.prisma.orderSettlement.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newOrderSettlement,
      message: 'OrderSettlement Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateOrderSettlement({
    body,
    res,
    orderSettlementId,
  }: {
    body: UpdateOrderSettlementDto;
    res: Response;
    orderSettlementId: string;
  }) {
    const initialDate = new Date();

    if (!body) {
      throw new BadRequestException(`No Fields provided to update`);
    }

    //verification, query generation
    const { updateQuery } = await UpdateOrderSettlementUtils({
      body,
      orderSettlementService: this,
      orderSettlementId,
    });

    const updatedOrderSettlement = await this.prisma.orderSettlement.update({
      where: {
        id: orderSettlementId,
      },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedOrderSettlement,
      message: 'OrderSettlement Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteOrderSettlement({
    orderSettlementId,
    res,
  }: {
    orderSettlementId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const { orderSettlement } = await DeleteOrderSettlementUtils({
      orderSettlementId,
      orderSettlementService: this,
    });

    const deleteOrderSettlement = await this.prisma.orderSettlement.delete({
      where: {
        id: orderSettlementId,
      },
    });

    if (orderSettlement.orderSettlementFile) {
      for (const osf of orderSettlement.orderSettlementFile) {
        this.fileUploadService.handleSingleFileDeletion(osf.proofImage);
      }
    }

    return this.responseService.successResponse({
      res,
      data: deleteOrderSettlement,
      message: 'OrderSettlement Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async uploadFile({
    file,
    res,
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();
    const uploadImage = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.SETTLEMENT_IMAGE,
      },
    });
    try {
      const orderSettlementFile = await this.prisma.orderSettlementFile.create({
        data: {
          proofImage: uploadImage.relativePath,
        },
      });

      return this.responseService.successResponse({
        res,
        data: orderSettlementFile,
        message: 'File uploaded Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(uploadImage.relativePath);

      throw err;
    }
  }

  /*---- helper func -----*/
  async findOrderSettlementById(id: string) {
    return await this.prisma.orderSettlement.findUnique({
      where: {
        id,
      },
      include: {
        orderSettlementFile: true,
      },
    });
  }

  async findUploadedIdsCount(ids: string[]) {
    return await this.prisma.orderSettlementFile.count({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async getOrderSettlementByDateAndVendor({
    date,
    vendorId,
  }: {
    date: Date;
    vendorId: string;
  }) {
    return await this.prisma.orderSettlement.findFirst({
      where: {
        vendorId,
        date,
      },
    });
  }
}
