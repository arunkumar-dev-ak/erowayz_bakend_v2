import { BadRequestException, Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBankDetailDto } from './dto/create-bank-detail.dto';
import { ResponseService } from 'src/response/response.service';
import { Response } from 'express';
import { UpdatedBankDetailDto } from './dto/update-bank-detail.dto';
import { bankDetailUpdateUtils } from './utils/bank-detail-update.utils';
import { UpdateBankDetailVerifyDto } from './dto/update-bank-detail-verify.dto';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';
import { GetBankQueryDto } from './dto/get-bank-query.dto';
import { buildBankDetailWhereFilter } from './utils/get-bank-detail.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { BankNameNameService } from 'src/bank-name/bank-name.service';
import { Status } from '@prisma/client';
import { BankPaymenttypeService } from 'src/bank-paymenttype/bank-paymenttype.service';

@Injectable()
export class BankDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly responseService: ResponseService,
    private readonly bankNameService: BankNameNameService,
    private readonly bankPaymentTypeService: BankPaymenttypeService,
  ) {}

  async getAllBankDetailForAdmin({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetBankQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildBankDetailWhereFilter({
      query,
    });

    const totalCount = await this.prisma.bankDetail.count({ where });

    const keyWords = await this.prisma.bankDetail.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendor: {
          include: {
            User: {
              select: {
                name: true,
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
        bankNameRel: true,
        bankPaymentRel: true,
      },
      orderBy: {
        isVerified: 'asc',
      },
    });

    const queries = buildQueryParams({
      accountHolderName: query.accountHolderName,
      accountNumber: query.accountNumber,
      bankName: query.bankName,
      ifscCode: query.ifscCode,
      vendorId: query.vendorId,
      vendorName: query.vendorName,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'bank-detail',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: keyWords,
      meta,
      message: 'Bank Detail retrieved successfully',
      statusCode: 200,
    });
  }

  async getBankDetailForVendor({
    res,
    vendorId,
  }: {
    res: Response;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const bankDetails = await this.prisma.bankDetail.findUnique({
      where: {
        vendorId,
      },
      include: {
        vendor: {
          include: {
            User: {
              select: {
                name: true,
              },
            },
          },
        },
        bankNameRel: true,
        bankPaymentRel: true,
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: bankDetails,
      message: 'BankDetail fetched successfully',
      statusCode: 200,
    });
  }

  async createBankDetai({
    body,
    res,
    vendorId,
  }: {
    body: CreateBankDetailDto;
    res: Response;
    vendorId: string;
  }) {
    const initialDate = new Date();

    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankNameId,
      branchName,
      accountType,
      upiId,
      linkedPhoneNumber,
      bankPaymentTypeId,
    } = body;

    const [existingBankDetails, existingBankName, existingBankPaymentType] =
      await Promise.all([
        this.checkBankDetailsByVendor(vendorId),
        this.bankNameService.getBankNameById(bankNameId),
        bankPaymentTypeId
          ? this.bankPaymentTypeService.getBankPaymentTypeById(
              bankPaymentTypeId,
            )
          : null,
      ]);

    if (existingBankDetails) {
      throw new BadRequestException(
        'Bank details already exists.You muts edit or delete that one and bnot to create an extra one',
      );
    }
    if (!existingBankName || existingBankName.status === Status.INACTIVE) {
      throw new BadRequestException('Bank Name Not found or Inactive');
    }
    if (bankPaymentTypeId) {
      if (!existingBankPaymentType) {
        throw new BadRequestException('Bank Payment Type not found');
      }
    }

    const newBankDetail = await this.prisma.bankDetail.create({
      data: {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankNameId,
        branchName,
        accountType,
        upiId,
        vendorId,
        linkedPhoneNumber,
        ...(bankPaymentTypeId && { bankPaymentTypeId }),
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: newBankDetail,
      message: 'BankDetail created successfully',
      statusCode: 200,
    });
  }

  async updateBankDetail({
    body,
    res,
    vendorId,
    bankDetailId,
  }: {
    body: UpdatedBankDetailDto;
    res: Response;
    vendorId: string;
    bankDetailId: string;
  }) {
    const initialDate = new Date();

    const { updateQuery } = await bankDetailUpdateUtils({
      body,
      vendorId,
      bankDetailService: this,
      bankDetailId,
      bankNameService: this.bankNameService,
      bankPaymentTypeService: this.bankPaymentTypeService,
    });

    const updatedBankDetail = await this.prisma.bankDetail.update({
      where: {
        id: bankDetailId,
      },
      data: { ...updateQuery, isVerified: false },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: updatedBankDetail,
      message: 'BankDetail updated successfully',
      statusCode: 200,
    });
  }

  async changeBankDetailStatus({
    res,
    body,
    bankDetailId,
  }: {
    res: Response;
    body: UpdateBankDetailVerifyDto;
    bankDetailId: string;
  }) {
    const initialDate = new Date();

    const { isVerified } = body;

    // Check if bank detail exists
    const existingBankDetails = await this.checkBankDetailsById(bankDetailId);
    if (!existingBankDetails) {
      throw new BadRequestException('BankDetails not found');
    }

    const updatedBankDetail = await this.prisma.bankDetail.update({
      where: {
        id: bankDetailId,
      },
      data: {
        isVerified: TrueOrFalseMap[isVerified],
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: updatedBankDetail,
      message: `Bank detail updated successfully`,
      statusCode: 200,
    });
  }

  /*----- Bank Details -----*/
  async checkBankDetailsByVendor(vendorId: string) {
    return await this.prisma.bankDetail.findUnique({
      where: {
        vendorId,
      },
    });
  }

  async checkBankDetailsById(id: string) {
    return await this.prisma.bankDetail.findUnique({
      where: {
        id,
      },
      include: {
        vendor: true,
      },
    });
  }
}
