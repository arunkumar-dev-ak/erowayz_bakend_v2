import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { AdminSettlementQueryDto } from './dto/admin-settlement.dto';
import { getSettlements } from './utils/get-order-settlement.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { GetAdminIndividulaSettlementQueryDto } from './dto/admin-order-ind-settlement';
import { getAdminIndividualSettlements } from './utils/get-order-ind-settlement.utils';
import { getOrderSettlementsForVendor } from './utils/get-vendor-order-settlement.utils';

type CountResult = { totalcount: number };

@Injectable()
export class SettlementService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getOrderSettlementForAdmin({
    res,
    offset,
    limit,
    query,
  }: {
    res: Response;
    offset: number;
    limit: number;
    query: AdminSettlementQueryDto;
  }) {
    const initialDate = new Date();

    // build SQL and count SQL from helper
    const { sql, countSql } = getSettlements({
      query,
      offset,
      limit,
    });

    // execute both queries
    const rows = await this.prismaService.$queryRawUnsafe<any[]>(sql);
    const [countResult] =
      await this.prismaService.$queryRawUnsafe<CountResult[]>(countSql);

    const totalcount = countResult.totalcount;

    const queries = buildQueryParams({
      date: query.date.toString(),
      shopName: query.shopName,
      planName: query.planName,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount: Number(totalcount),
      offset,
      limit,
      path: 'settlement/admin/order',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: rows,
      meta,
      message: 'Settlements retrieved successfully',
      statusCode: 200,
    });
  }

  async getIndividualOrderSettlementForAdmin({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetAdminIndividulaSettlementQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    // Step 1: Build where filters
    const { where } = getAdminIndividualSettlements({
      query,
    });

    // Step 2: Total count
    const totalCount = await this.prismaService.orderPayment.count({
      where,
    });

    // Step 3: Fetch paginated data
    const settlements = await this.prismaService.orderPayment.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        order: true, // or related models you want (shop, user, payment, etc.)
      },
    });

    // Step 4: Build query params for meta
    const queries = buildQueryParams({
      vendorId: query.vendorId,
      date: query.date.toString(),
    });

    // Step 5: Metadata for pagination
    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'settlement/individualOrderSettlement',
      queries,
    });

    // Step 6: Return final response
    return this.responseService.successResponse({
      initialDate,
      res,
      data: settlements,
      meta,
      message: 'Individual Order Settlements retrieved successfully',
      statusCode: 200,
    });
  }

  async getOrderSettlementForVendor({
    res,
    date,
    vendorId,
  }: {
    res: Response;
    vendorId: string;
    date: Date;
  }) {
    const initialDate = new Date();

    const { sql } = getOrderSettlementsForVendor({
      date,
      vendorId,
    });

    // Execute the query
    const rows = await this.prismaService.$queryRawUnsafe<any[]>(sql);

    // Build query params for metadata
    const queries = buildQueryParams({
      date: date.toString(),
      vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount: rows.length,
      offset: 0,
      limit: 0,
      path: 'settlement/vendor/order',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: rows,
      meta,
      message: 'Vendor settlements retrieved successfully',
      statusCode: 200,
    });
  }
}
