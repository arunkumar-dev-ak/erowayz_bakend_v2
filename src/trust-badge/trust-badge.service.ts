import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus, TrustSetting } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ResponseService } from '../response/response.service';
import { UpdateTrustSettingDto } from './dto/update-trust-setting.dto';

const CACHE_KEY_TRUST_SETTING = 'trust_badge:settings';
const DEFAULT_THRESHOLD = 15;
const CACHE_TTL_SECONDS = 3600; // 1 hour

@Injectable()
export class TrustBadgeService {
  private readonly logger = new Logger(TrustBadgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly responseService: ResponseService,
  ) {}

  /**
   * Retrieves active TrustSetting, leveraging Redis cache for ultra-low latency.
   * Auto-seeds default setting if not present in DB.
   */
  async getTrustSettings(): Promise<TrustSetting> {
    try {
      const cached = await this.redisService.get(CACHE_KEY_TRUST_SETTING);
      if (cached) {
        return JSON.parse(cached) as TrustSetting;
      }
    } catch (err: any) {
      this.logger.warn(`Redis get failed for trust settings: ${err?.message ?? err}`);
    }

    let setting = await this.prisma.trustSetting.findFirst();
    if (!setting) {
      setting = await this.prisma.trustSetting.create({
        data: {
          orderThreshold: DEFAULT_THRESHOLD,
          isActive: true,
          description:
            'Target completed orders threshold across Street Food, Common Shops, and Vehicle Services',
        },
      });
    }

    try {
      await this.redisService.set(
        CACHE_KEY_TRUST_SETTING,
        JSON.stringify(setting),
        CACHE_TTL_SECONDS,
      );
    } catch (err: any) {
      this.logger.warn(`Redis set failed for trust settings: ${err?.message ?? err}`);
    }

    return setting;
  }

  /**
   * Admin updates trust threshold and active status.
   */
  async updateTrustSettings({
    body,
    res,
  }: {
    body: UpdateTrustSettingDto;
    res: Response;
  }) {
    const initialDate = new Date();
    let setting = await this.prisma.trustSetting.findFirst();

    if (setting) {
      setting = await this.prisma.trustSetting.update({
        where: { id: setting.id },
        data: {
          orderThreshold: body.orderThreshold,
          isActive: body.isActive !== undefined ? body.isActive : setting.isActive,
          description: body.description ?? setting.description,
        },
      });
    } else {
      setting = await this.prisma.trustSetting.create({
        data: {
          orderThreshold: body.orderThreshold,
          isActive: body.isActive ?? true,
          description: body.description,
        },
      });
    }

    // Refresh Redis cache
    try {
      await this.redisService.set(
        CACHE_KEY_TRUST_SETTING,
        JSON.stringify(setting),
        CACHE_TTL_SECONDS,
      );
    } catch (err: any) {
      this.logger.warn(`Redis set failed after update: ${err?.message ?? err}`);
    }

    return this.responseService.successResponse({
      res,
      data: setting,
      message: 'Trust settings updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /**
   * Fast evaluation of whether a customer has earned the trust badge.
   * Groups completed orders across Street Food, Common Shops (Order) and Vehicle Services (Booking).
   */
  async isCustomerTrusted(userId: string): Promise<boolean> {
    const setting = await this.getTrustSettings();
    if (!setting || !setting.isActive) {
      return false;
    }

    const [ordersCount, bookingsCount] = await Promise.all([
      this.prisma.order.count({
        where: {
          userId,
          orderStatus: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
      }),
      this.prisma.booking.count({
        where: {
          userId,
          bookingStatus: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
      }),
    ]);

    return ordersCount + bookingsCount >= setting.orderThreshold;
  }

  /**
   * Returns full trust breakdown and stats for a customer (Admin customer profile / detail view).
   */
  async getCustomerTrustStats(userId: string) {
    const setting = await this.getTrustSettings();
    const threshold = setting?.orderThreshold ?? DEFAULT_THRESHOLD;
    const isActive = setting?.isActive ?? true;

    const [ordersCount, bookingsCount] = await Promise.all([
      this.prisma.order.count({
        where: {
          userId,
          orderStatus: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
      }),
      this.prisma.booking.count({
        where: {
          userId,
          bookingStatus: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
      }),
    ]);

    const totalCompletedOrders = ordersCount + bookingsCount;
    const isTrustedCustomer = isActive && totalCompletedOrders >= threshold;

    return {
      isTrustedCustomer,
      totalCompletedOrders,
      ordersCount,
      bookingsCount,
      threshold,
      isActive,
    };
  }

  /**
   * Efficient batch resolution of customer trust status for list views (e.g. Admin users list).
   * Runs exactly 2 grouped queries to prevent N+1 overhead.
   */
  async batchGetCustomerTrustStatus(
    userIds: string[],
  ): Promise<Map<string, { isTrustedCustomer: boolean; totalCompletedOrders: number }>> {
    const result = new Map<
      string,
      { isTrustedCustomer: boolean; totalCompletedOrders: number }
    >();

    if (!userIds || userIds.length === 0) {
      return result;
    }

    const uniqueIds = Array.from(new Set(userIds));
    const setting = await this.getTrustSettings();
    const threshold = setting?.orderThreshold ?? DEFAULT_THRESHOLD;
    const isActive = setting?.isActive ?? true;

    const [orderGroups, bookingGroups] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['userId'],
        where: {
          userId: { in: uniqueIds },
          orderStatus: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
        _count: { id: true },
      }),
      this.prisma.booking.groupBy({
        by: ['userId'],
        where: {
          userId: { in: uniqueIds },
          bookingStatus: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
        _count: { id: true },
      }),
    ]);

    const orderCountMap = new Map<string, number>();
    for (const group of orderGroups) {
      orderCountMap.set(group.userId, group._count.id);
    }

    const bookingCountMap = new Map<string, number>();
    for (const group of bookingGroups) {
      bookingCountMap.set(group.userId, group._count.id);
    }

    for (const uid of uniqueIds) {
      const orders = orderCountMap.get(uid) ?? 0;
      const bookings = bookingCountMap.get(uid) ?? 0;
      const totalCompletedOrders = orders + bookings;
      const isTrustedCustomer = isActive && totalCompletedOrders >= threshold;

      result.set(uid, {
        isTrustedCustomer,
        totalCompletedOrders,
      });
    }

    return result;
  }
}
