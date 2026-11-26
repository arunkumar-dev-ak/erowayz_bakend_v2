import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BusinessLoadTier, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateBusinessLoadTierDto } from './dto/create-business-load-tier.dto';
import { UpdateBusinessLoadTierDto } from './dto/update-business-load-tier.dto';

export const CACHE_KEY_BUSINESS_LOAD_TIERS = 'business_load:tiers';
export const CACHE_TTL_ONE_DAY_SECONDS = 86400; // 1 day

export const DEFAULT_BUSINESS_LOAD_TIERS = [
  {
    name: 'Normal',
    minOrders: 0,
    maxOrders: 0,
    color: '#22C55E',
    estimatedWaitTimeText: '10-15 mins',
    orderIndex: 0,
    isActive: true,
  },
  {
    name: 'Light',
    minOrders: 1,
    maxOrders: 1,
    color: '#84CC16',
    estimatedWaitTimeText: '15-20 mins',
    orderIndex: 1,
    isActive: true,
  },
  {
    name: 'Moderate',
    minOrders: 2,
    maxOrders: 2,
    color: '#EAB308',
    estimatedWaitTimeText: '20-25 mins',
    orderIndex: 2,
    isActive: true,
  },
  {
    name: 'Busy',
    minOrders: 3,
    maxOrders: 3,
    color: '#F97316',
    estimatedWaitTimeText: '25-35 mins',
    orderIndex: 3,
    isActive: true,
  },
  {
    name: 'Heavy',
    minOrders: 4,
    maxOrders: 4,
    color: '#EA580C',
    estimatedWaitTimeText: '35-45 mins',
    orderIndex: 4,
    isActive: true,
  },
  {
    name: 'MAX BUSY',
    minOrders: 5,
    maxOrders: null,
    color: '#DC2626',
    estimatedWaitTimeText: '45+ mins',
    orderIndex: 5,
    isActive: true,
  },
];

@Injectable()
export class BusinessLoadService {
  private readonly logger = new Logger(BusinessLoadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  //Invalidates Redis cache for active business load tiers
  async invalidateTiersCache(): Promise<void> {
    try {
      await this.redisService.rem(CACHE_KEY_BUSINESS_LOAD_TIERS);
      this.logger.log('Invalidated business load tiers Redis cache');
    } catch (err: any) {
      this.logger.warn(
        `Redis rem failed for business load: ${err?.message ?? err}`,
      );
    }
  }

  /**
   * Retrieves active tiers from Redis cache (TTL 1 day) or fallback to DB.
   * Auto-seeds default 6 tiers if table is empty.
   */
  async getActiveTiers(): Promise<BusinessLoadTier[]> {
    try {
      const cached = await this.redisService.get(CACHE_KEY_BUSINESS_LOAD_TIERS);
      if (cached) {
        return JSON.parse(cached) as BusinessLoadTier[];
      }
    } catch (err: any) {
      this.logger.warn(
        `Redis get failed for business load: ${err?.message ?? err}`,
      );
    }

    let tiers = await this.prisma.businessLoadTier.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    // Auto-seed defaults if table is empty
    if (!tiers || tiers.length === 0) {
      this.logger.log(
        'No business load tiers found; auto-seeding default 6 tiers',
      );
      await this.prisma.businessLoadTier.createMany({
        data: DEFAULT_BUSINESS_LOAD_TIERS,
      });

      tiers = await this.prisma.businessLoadTier.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      });
    }

    try {
      await this.redisService.set(
        CACHE_KEY_BUSINESS_LOAD_TIERS,
        JSON.stringify(tiers),
        CACHE_TTL_ONE_DAY_SECONDS,
      );
    } catch (err: any) {
      this.logger.warn(
        `Redis set failed for business load: ${err?.message ?? err}`,
      );
    }

    return tiers;
  }

  // Calculates live business load for a specific vendor based on active in-progress orders.
  async getVendorBusinessLoad(vendorId: string) {
    if (!vendorId) {
      throw new BadRequestException('Vendor ID is required');
    }

    // 1. Count active IN_PROGRESS orders for this vendor
    const activeOrdersCount = await this.prisma.order.count({
      where: {
        orderStatus: OrderStatus.IN_PROGRESS,
        orderItems: {
          some: {
            orderItemVendorServiceOption: {
              some: {
                vendorServiceOption: {
                  vendorId,
                },
              },
            },
          },
        },
      },
    });

    // 2. Fetch active cached tiers
    const tiers = await this.getActiveTiers();

    // 3. Match active count against tiers
    const matchedTier =
      tiers.find((tier) => {
        const meetsMin = activeOrdersCount >= tier.minOrders;
        const meetsMax =
          tier.maxOrders === null ||
          tier.maxOrders === undefined ||
          activeOrdersCount <= tier.maxOrders;
        return meetsMin && meetsMax;
      }) ?? (tiers.length > 0 ? tiers[tiers.length - 1] : null);

    return {
      vendorId,
      activeOrdersCount,
      tier: matchedTier
        ? {
            id: matchedTier.id,
            name: matchedTier.name,
            color: matchedTier.color,
            estimatedWaitTimeText: matchedTier.estimatedWaitTimeText,
            minOrders: matchedTier.minOrders,
            maxOrders: matchedTier.maxOrders,
            orderIndex: matchedTier.orderIndex,
          }
        : null,
    };
  }

  // Admin: List all tiers (both active and inactive)
  async getAllTiersAdmin() {
    return await this.prisma.businessLoadTier.findMany({
      orderBy: { orderIndex: 'asc' },
    });
  }

  // Admin: Create a new custom tier
  async createTier(dto: CreateBusinessLoadTierDto) {
    const tier = await this.prisma.businessLoadTier.create({
      data: {
        name: dto.name,
        minOrders: dto.minOrders,
        maxOrders: dto.maxOrders ?? null,
        color: dto.color,
        estimatedWaitTimeText: dto.estimatedWaitTimeText ?? '15-20 mins',
        orderIndex: dto.orderIndex ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    await this.invalidateTiersCache();
    return tier;
  }

  // Admin: Update an existing tier
  async updateTier(id: string, dto: UpdateBusinessLoadTierDto) {
    const existing = await this.prisma.businessLoadTier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Business load tier with ID ${id} not found`);
    }

    const updated = await this.prisma.businessLoadTier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.minOrders !== undefined && { minOrders: dto.minOrders }),
        ...(dto.maxOrders !== undefined && { maxOrders: dto.maxOrders }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.estimatedWaitTimeText !== undefined && {
          estimatedWaitTimeText: dto.estimatedWaitTimeText,
        }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.invalidateTiersCache();
    return updated;
  }

  // Admin: Delete a tier
  async deleteTier(id: string) {
    const existing = await this.prisma.businessLoadTier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Business load tier with ID ${id} not found`);
    }

    const deleted = await this.prisma.businessLoadTier.delete({
      where: { id },
    });

    await this.invalidateTiersCache();
    return deleted;
  }
}
