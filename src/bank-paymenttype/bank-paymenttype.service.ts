import { Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetBankPaymentTypeQueryDto } from './dto/get-bank-paymenttype.dto';
import { buildBankPaymentTypeWhereFilter } from './utils/get-bank-paymenttype.utils';
import { Response } from 'express';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { CreateBankPaymentTypeDto } from './dto/create-bank-paymenttype.dto';
import { UpdateBankPaymentTypeDto } from './dto/update-bank-paymenttype.dto';
import { CreateBankPaymentTypeUtils } from './utils/create-bank-paymenttype.utils';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UpdateBankPaymentTypeUtils } from './utils/update-bank-paymenttype.utils';
import { DeletePaymentTypeUtils } from './utils/delete-bank-paymenttype.utils';

@Injectable()
export class BankPaymenttypeService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getBankPaymentType({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetBankPaymentTypeQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildBankPaymentTypeWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.bankPaymentType.count({
      where,
    });

    const bankPaymentTypes = await this.prismaService.bankPaymentType.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      name: query.name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'bankPaymentType',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: bankPaymentTypes,
      meta,
      message: 'BankPaymentTypes retrieved successfully',
      statusCode: 200,
    });
  }

  async createBankPaymentType({
    body,
    res,
    file,
  }: {
    body: CreateBankPaymentTypeDto;
    res: Response;
    file: Express.Multer.File;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery, uploadedFile } = await CreateBankPaymentTypeUtils({
      body,
      bankPaymentTypeService: this,
      file,
      fileUploadService: this.fileUploadService,
    });
    try {
      const newBankPaymentType =
        await this.prismaService.bankPaymentType.create({
          data: createQuery,
        });

      return this.responseService.successResponse({
        res,
        data: newBankPaymentType,
        message: 'BankPaymentType Created Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(
        uploadedFile.relativePath,
      );
      throw err;
    }
  }

  async updateBankPaymentType({
    body,
    res,
    bankPaymentTypeId,
    file,
  }: {
    body: UpdateBankPaymentTypeDto;
    res: Response;
    bankPaymentTypeId: string;
    file?: Express.Multer.File;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { updateQuery, uploadedFile, existingPaymentType } =
      await UpdateBankPaymentTypeUtils({
        body,
        bankPaymentTypeService: this,
        bankPaymentTypeId,
        file,
        fileUploadService: this.fileUploadService,
      });

    try {
      const updatedBankPaymentType =
        await this.prismaService.bankPaymentType.update({
          where: {
            id: bankPaymentTypeId,
          },
          data: updateQuery,
        });

      if (uploadedFile) {
        this.fileUploadService.handleSingleFileDeletion(
          existingPaymentType.image,
        );
      }

      return this.responseService.successResponse({
        res,
        data: updatedBankPaymentType,
        message: 'BankPaymentType Updated Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      if (uploadedFile) {
        this.fileUploadService.handleSingleFileDeletion(
          uploadedFile.relativePath,
        );
      }
      throw err;
    }
  }

  async deleteBankPaymentType({
    bankPaymentTypeId,
    res,
  }: {
    bankPaymentTypeId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    await DeletePaymentTypeUtils({
      bankPaymentTypeId,
      bankPaymentTypeService: this,
    });

    const deleteBankPaymentType =
      await this.prismaService.bankPaymentType.delete({
        where: {
          id: bankPaymentTypeId,
        },
      });

    return this.responseService.successResponse({
      res,
      data: deleteBankPaymentType,
      message: 'BankPaymentType Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getBankPaymentTypeByName(name: string) {
    return await this.prismaService.bankPaymentType.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async checkBankPaymentTypeHasShop(bankPaymentTypeId: string) {
    return await this.prismaService.bankPaymentType.findFirst({
      where: {
        id: bankPaymentTypeId,
        bankDetail: { some: {} },
      },
    });
  }

  async getBankPaymentTypeById(id: string) {
    return await this.prismaService.bankPaymentType.findUnique({
      where: {
        id,
      },
    });
  }
}
