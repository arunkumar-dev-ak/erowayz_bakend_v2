import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { UpdateErrorLogDto } from './dto/update-error-log.dto';
import { UpdateErrorLogUtils } from './utils/update-error-log.utils';
import { GetErrorLogQueryDto } from './dto/get-error-log.dto';
import { buildErrorLogWhereFilter } from './utils/get-error-log.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class ErrorLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly responseService: ResponseService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getErrorLog({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetErrorLogQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildErrorLogWhereFilter({
      query,
    });

    const totalCount = await this.prisma.paymentErrorLog.count({
      where,
    });

    const errorLog = await this.prisma.paymentErrorLog.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      userName: query.userName,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'error-log',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: errorLog,
      meta,
      message: 'Citys retrieved successfully',
      statusCode: 200,
    });
  }

  async logPaymentError({
    tx,
    referenceId,
    vendorUserId,
    customerUserId,
    errorType,
    message,
    metaData,
  }: {
    referenceId: string;
    vendorUserId: string;
    customerUserId?: string;
    errorType: string;
    message: string;
    metaData?: Record<string, any>;
    tx?: Prisma.TransactionClient;
  }) {
    const prisma = tx ?? this.prisma;
    await prisma.paymentErrorLog.create({
      data: {
        referenceId,
        vendorUserId,
        customerUserId,
        errorType,
        message,
        metaData,
      },
    });
  }

  async updatePaymentError({
    body,
    res,
    errorLogId,
  }: {
    body: UpdateErrorLogDto;
    res: Response;
    errorLogId: string;
  }) {
    const initialDate = new Date();

    if (!body) {
      throw new BadRequestException(`No Fields provided to update`);
    }

    //verification, query generation
    const { updateQuery } = await UpdateErrorLogUtils({
      body,
      errorLogService: this,
      errorLogId,
    });

    const updatedPaymentError = await this.prisma.paymentErrorLog.update({
      where: {
        id: errorLogId,
      },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedPaymentError,
      message: 'Payment Error Updated Successfully',
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
        type: ImageTypeEnum.ERROR_LOG_IMAGE,
      },
    });
    try {
      const errorLogFile = await this.prisma.paymentErrorLogFile.create({
        data: {
          image: uploadImage.relativePath,
        },
      });

      return this.responseService.successResponse({
        res,
        data: errorLogFile,
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
  async findErrorLogById(id: string) {
    return await this.prisma.paymentErrorLog.findUnique({
      where: {
        id,
      },
      include: {
        customerUser: true,
        vendorUser: true,
      },
    });
  }
}
