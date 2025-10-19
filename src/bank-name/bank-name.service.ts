import { BadRequestException, Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetBankNameQueryDto } from './dto/get-bank.dto';
import { buildBankNameWhereFilter } from './utils/get-bank.utils';
import { Response } from 'express';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { CreateBankNameDto } from './dto/create-bank.dto';
import { CreateBankNameUtils } from './utils/create-bank.utils';
import { UpdateBankNameDto } from './dto/update-bank.dto';
import { UpdateBankNameUtils } from './utils/update-bank.utils';
import { DeleteBankNameUtils } from './utils/delete-bank.utils';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class BankNameNameService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getBankName({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetBankNameQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildBankNameWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.bankName.count({
      where,
    });

    const bankNames = await this.prismaService.bankName.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      name: query.name,
      status: query.status,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'bankName',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: bankNames,
      meta,
      message: 'BankNames retrieved successfully',
      statusCode: 200,
    });
  }

  async createBankName({
    body,
    res,
    file,
  }: {
    body: CreateBankNameDto;
    res: Response;
    file: Express.Multer.File;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery, uploadedImage } = await CreateBankNameUtils({
      body,
      bankNameService: this,
      file,
      fileUploadService: this.fileUploadService,
    });
    try {
      const newBankName = await this.prismaService.bankName.create({
        data: createQuery,
      });

      return this.responseService.successResponse({
        res,
        data: newBankName,
        message: 'BankName Created Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(
        uploadedImage.relativePath,
      );
      throw err;
    }
  }

  async updateBankName({
    body,
    res,
    bankNameId,
    file,
  }: {
    body: UpdateBankNameDto;
    res: Response;
    bankNameId: string;
    file?: Express.Multer.File;
  }) {
    const initialDate = new Date();

    if (!body && !file) {
      throw new BadRequestException(
        'File or name,status,tamilName is required',
      );
    }

    //verification, query generation
    const { updateQuery, existingBankName, uploadImage } =
      await UpdateBankNameUtils({
        body,
        bankNameService: this,
        bankNameId,
        fileUploadService: this.fileUploadService,
        file,
      });
    try {
      const updatedBankName = await this.prismaService.bankName.update({
        where: {
          id: bankNameId,
        },
        data: updateQuery,
      });
      if (uploadImage) {
        this.fileUploadService.handleSingleFileDeletion(existingBankName.image);
      }

      return this.responseService.successResponse({
        res,
        data: updatedBankName,
        message: 'BankName Updated Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      if (uploadImage) {
        this.fileUploadService.handleSingleFileDeletion(
          uploadImage.relativePath,
        );
      }
      throw err;
    }
  }

  async deleteBankName({
    bankNameId,
    res,
  }: {
    bankNameId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    await DeleteBankNameUtils({
      bankNameId,
      bankNameService: this,
    });

    const deleteBankName = await this.prismaService.bankName.delete({
      where: {
        id: bankNameId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deleteBankName,
      message: 'BankName Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getBankNameByName(name: string) {
    return await this.prismaService.bankName.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async checkBankNameHasBankDetail(bankNameId: string) {
    return await this.prismaService.bankName.findFirst({
      where: {
        id: bankNameId,
        bankDetail: { some: {} },
      },
    });
  }

  async getBankNameById(id: string) {
    return await this.prismaService.bankName.findUnique({
      where: {
        id,
      },
    });
  }
}
