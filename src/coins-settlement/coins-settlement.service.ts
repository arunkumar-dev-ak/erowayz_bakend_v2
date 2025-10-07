import { BadRequestException, Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import {
  buildCoinSettlementWhereFilter,
  buildWalletTransactionWhereFilter,
} from './utils/get-coins-settlement.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Response } from 'express';
import { DeleteCoinSettlementUtils } from './utils/delete-coins-settlement.utils';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { GetCoinSettlementQueryDto } from './dto/get-coins-settlement';
import { CreateCoinSettlementDto } from './dto/create-coins-settlement';
import { CreateCoinsSettlementUtils } from './utils/create-coins-settlement.utils';
import { UpdateCoinSettlementDto } from './dto/update-coins-settlement';
import { UpdateCoinsSettlementUtils } from './utils/update-coins-settlement.utils';

@Injectable()
export class CoinsSettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly responseService: ResponseService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getCoinSettlement({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetCoinSettlementQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const { where } = buildCoinSettlementWhereFilter({
      query,
    });

    const totalCount = await this.prisma.coinsSettlement.count({
      where,
    });

    const coinSettlements = await this.prisma.coinsSettlement.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const { vendorName, walletTransactionId, shopName, id, vendorId } = query;

    const queries = buildQueryParams({
      vendorName,
      walletTransactionId,
      shopName,
      id,
      vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'coinSettlement/admin',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: coinSettlements,
      meta,
      message: 'CoinSettlements retrieved successfully',
      statusCode: 200,
    });
  }

  async getCoinSettlementForVendoe({
    res,
    query,
    offset,
    limit,
    vendorId,
  }: {
    res: Response;
    query: GetCoinSettlementQueryDto;
    offset: number;
    limit: number;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const { where } = buildWalletTransactionWhereFilter({
      query,
      vendorId,
    });

    const totalCount = await this.prisma.walletTransaction.count({
      where,
    });

    const coinSettlements = await this.prisma.walletTransaction.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        coinsSettlement: {
          include: {
            coinsSettlementFile: true,
          },
        },
      },
    });

    const { vendorName, walletTransactionId, shopName, id } = query;

    const queries = buildQueryParams({
      vendorName,
      walletTransactionId,
      shopName,
      id,
      vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'coinSettlement/vendor',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: coinSettlements,
      meta,
      message: 'CoinSettlements retrieved successfully',
      statusCode: 200,
    });
  }

  async createCoinSettlement({
    body,
    res,
  }: {
    body: CreateCoinSettlementDto;
    res: Response;
  }) {
    const initialDate = new Date();

    //verification, query generation
    const { createQuery } = await CreateCoinsSettlementUtils({
      body,
      coinSettlementService: this,
    });

    const newCoinSettlement = await this.prisma.coinsSettlement.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newCoinSettlement,
      message: 'CoinSettlement Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateCoinSettlement({
    body,
    res,
    coinSettlementId,
  }: {
    body: UpdateCoinSettlementDto;
    res: Response;
    coinSettlementId: string;
  }) {
    const initialDate = new Date();

    if (!body) {
      throw new BadRequestException(
        `One of the keys such as ${Object.keys(body).join('')} are required to update`,
      );
    }

    //verification, query generation
    const { updateQuery } = await UpdateCoinsSettlementUtils({
      body,
      coinSettlementService: this,
      coinSettlementId,
    });

    const updatedCoinSettlement = await this.prisma.coinsSettlement.update({
      where: {
        id: coinSettlementId,
      },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedCoinSettlement,
      message: 'CoinSettlement Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteCoinSettlement({
    coinSettlementId,
    res,
  }: {
    coinSettlementId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const { coinSettlement } = await DeleteCoinSettlementUtils({
      coinSettlementId,
      coinSettlementService: this,
    });

    const deleteCoinSettlement = await this.prisma.coinsSettlement.delete({
      where: {
        id: coinSettlementId,
      },
    });

    if (coinSettlement.coinsSettlementFile) {
      for (const csf of coinSettlement.coinsSettlementFile) {
        this.fileUploadService.handleSingleFileDeletion(csf.proofImage);
      }
    }

    return this.responseService.successResponse({
      res,
      data: deleteCoinSettlement,
      message: 'CoinSettlement Deleted Successfully',
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
      const coinSettlementFile = await this.prisma.coinsSettlementFile.create({
        data: {
          proofImage: uploadImage.relativePath,
        },
      });

      return this.responseService.successResponse({
        res,
        data: coinSettlementFile,
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
  async findWalletTransactionById(id: string) {
    return await this.prisma.walletTransaction.findUnique({
      where: { id },
      include: {
        coinsSettlement: true,
      },
    });
  }

  async findCoinSettlementById(id: string) {
    return await this.prisma.coinsSettlement.findUnique({
      where: {
        id,
      },
      include: {
        coinsSettlementFile: true,
      },
    });
  }

  async findUploadedIdsCount(ids: string[]) {
    return await this.prisma.coinsSettlementFile.count({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
