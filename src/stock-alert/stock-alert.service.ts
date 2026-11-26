import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { ResponseService } from 'src/response/response.service';
import {
  GetStockAlertsQueryDto,
  StockAlertFilter,
} from './dto/get-stock-alerts-query.dto';
import {
  buildStockAlertWhereFilter,
  formatStockAlertItem,
  getStockAlertConfig,
  STOCK_ALERT_ITEM_SELECT,
  STOCK_ALERT_PUBSUB_CHANNEL,
} from './utils/stock-alert.utils';

export interface StockAlertStackPayload {
  vendorId: string;
  threshold: number;
  stackLimit: number;
  totalAlertsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  alerts: ReturnType<typeof formatStockAlertItem>[];
}

export const stockAlertSocketsKey = (vendorId: string) =>
  `stock-alert-sockets:${vendorId}`;

export const stockAlertUserSocketKey = (socketId: string) =>
  `stock-alert-user:${socketId}`;

@Injectable()
export class StockAlertService {
  private readonly logger = new Logger(StockAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly responseService: ResponseService,
    private readonly metadataService: MetadataService,
  ) {}

  /**
   * Computes live stack payload (top N critical alerts + summary counts) for Vendor Dashboard.
   */
  async getVendorAlertStack(vendorId: string): Promise<StockAlertStackPayload> {
    const { threshold, stackLimit } = getStockAlertConfig();

    const allWhere = buildStockAlertWhereFilter({
      vendorId,
      threshold,
      filter: StockAlertFilter.ALL,
    });
    const lowStockWhere = buildStockAlertWhereFilter({
      vendorId,
      threshold,
      filter: StockAlertFilter.LOW_STOCK,
    });
    const outOfStockWhere = buildStockAlertWhereFilter({
      vendorId,
      threshold,
      filter: StockAlertFilter.OUT_OF_STOCK,
    });

    const [topItems, totalAlertsCount, lowStockCount, outOfStockCount] =
      await Promise.all([
        this.prisma.item.findMany({
          where: allWhere,
          take: stackLimit,
          orderBy: [{ remainingQty: 'asc' }, { updatedAt: 'desc' }],
          select: STOCK_ALERT_ITEM_SELECT,
        }),
        this.prisma.item.count({ where: allWhere }),
        this.prisma.item.count({ where: lowStockWhere }),
        this.prisma.item.count({ where: outOfStockWhere }),
      ]);

    return {
      vendorId,
      threshold,
      stackLimit,
      totalAlertsCount,
      lowStockCount,
      outOfStockCount,
      alerts: topItems.map((item) => formatStockAlertItem(item, threshold)),
    };
  }

  /**
   * Checks if the vendor currently has open WebSocket connections; if yes,
   * computes the fresh stack and publishes it over Redis Pub/Sub.
   */
  async publishVendorStockAlerts(vendorId: string): Promise<void> {
    if (!vendorId) return;

    try {
      const activeSocketCount = await this.redisService.scard(
        stockAlertSocketsKey(vendorId),
      );
      if (activeSocketCount <= 0) {
        return;
      }

      const payload = await this.getVendorAlertStack(vendorId);
      await this.redisService.publish(
        STOCK_ALERT_PUBSUB_CHANNEL,
        JSON.stringify(payload),
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed to publish stock alerts for vendor ${vendorId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Dedicated Stock Alert Page: Paginated list of all active items below threshold or out of stock.
   */
  async getVendorStockAlertsPage({
    vendorId,
    query,
    res,
  }: {
    vendorId: string;
    query: GetStockAlertsQueryDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { threshold } = getStockAlertConfig();
    const filter = query.filter ?? StockAlertFilter.ALL;
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '10');

    const where = buildStockAlertWhereFilter({
      vendorId,
      threshold,
      filter,
      search: query.search,
    });

    const allWhere = buildStockAlertWhereFilter({
      vendorId,
      threshold,
      filter: StockAlertFilter.ALL,
    });
    const lowStockWhere = buildStockAlertWhereFilter({
      vendorId,
      threshold,
      filter: StockAlertFilter.LOW_STOCK,
    });
    const outOfStockWhere = buildStockAlertWhereFilter({
      vendorId,
      threshold,
      filter: StockAlertFilter.OUT_OF_STOCK,
    });

    const [
      filteredCount,
      items,
      totalAlertsCount,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      this.prisma.item.count({ where }),
      this.prisma.item.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [{ remainingQty: 'asc' }, { updatedAt: 'desc' }],
        select: STOCK_ALERT_ITEM_SELECT,
      }),
      this.prisma.item.count({ where: allWhere }),
      this.prisma.item.count({ where: lowStockWhere }),
      this.prisma.item.count({ where: outOfStockWhere }),
    ]);

    const queries = buildQueryParams({
      filter,
      search: query.search,
    });

    const meta = this.metadataService.createMetaData({
      totalCount: filteredCount,
      offset,
      limit,
      path: 'stock-alert/vendor',
      queries,
    });

    return this.responseService.successResponse({
      res,
      data: {
        threshold,
        summary: {
          totalAlertsCount,
          lowStockCount,
          outOfStockCount,
        },
        alerts: items.map((item) => formatStockAlertItem(item, threshold)),
      },
      meta,
      message: 'Vendor stock alerts retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
