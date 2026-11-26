import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BusinessLoadService,
  CACHE_KEY_BUSINESS_LOAD_TIERS,
  CACHE_TTL_ONE_DAY_SECONDS,
  DEFAULT_BUSINESS_LOAD_TIERS,
} from './business-load.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('BusinessLoadService', () => {
  let service: BusinessLoadService;
  let prismaMock: any;
  let redisMock: any;

  const mockTiers = [
    {
      id: 'tier-0',
      name: 'Normal',
      minOrders: 0,
      maxOrders: 0,
      color: '#22C55E',
      estimatedWaitTimeText: '10-15 mins',
      orderIndex: 0,
      isActive: true,
    },
    {
      id: 'tier-1',
      name: 'Light',
      minOrders: 1,
      maxOrders: 1,
      color: '#84CC16',
      estimatedWaitTimeText: '15-20 mins',
      orderIndex: 1,
      isActive: true,
    },
    {
      id: 'tier-2',
      name: 'Moderate',
      minOrders: 2,
      maxOrders: 2,
      color: '#EAB308',
      estimatedWaitTimeText: '20-25 mins',
      orderIndex: 2,
      isActive: true,
    },
    {
      id: 'tier-3',
      name: 'Busy',
      minOrders: 3,
      maxOrders: 3,
      color: '#F97316',
      estimatedWaitTimeText: '25-35 mins',
      orderIndex: 3,
      isActive: true,
    },
    {
      id: 'tier-4',
      name: 'Heavy',
      minOrders: 4,
      maxOrders: 4,
      color: '#EA580C',
      estimatedWaitTimeText: '35-45 mins',
      orderIndex: 4,
      isActive: true,
    },
    {
      id: 'tier-5',
      name: 'MAX BUSY',
      minOrders: 5,
      maxOrders: null,
      color: '#DC2626',
      estimatedWaitTimeText: '45+ mins',
      orderIndex: 5,
      isActive: true,
    },
  ];

  beforeEach(async () => {
    prismaMock = {
      businessLoadTier: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      order: {
        count: jest.fn(),
      },
    };

    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      rem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessLoadService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<BusinessLoadService>(BusinessLoadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveTiers with 1-day Redis caching', () => {
    it('should return cached tiers from Redis when available', async () => {
      redisMock.get.mockResolvedValue(JSON.stringify(mockTiers));

      const result = await service.getActiveTiers();

      expect(result).toEqual(mockTiers);
      expect(redisMock.get).toHaveBeenCalledWith(CACHE_KEY_BUSINESS_LOAD_TIERS);
      expect(prismaMock.businessLoadTier.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache in Redis with 86400s (1 day) TTL when Redis misses', async () => {
      redisMock.get.mockResolvedValue(null);
      prismaMock.businessLoadTier.findMany.mockResolvedValue(mockTiers);

      const result = await service.getActiveTiers();

      expect(result).toEqual(mockTiers);
      expect(prismaMock.businessLoadTier.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      });
      expect(redisMock.set).toHaveBeenCalledWith(
        CACHE_KEY_BUSINESS_LOAD_TIERS,
        JSON.stringify(mockTiers),
        CACHE_TTL_ONE_DAY_SECONDS,
      );
    });

    it('should auto-seed default 6 tiers when DB is empty', async () => {
      redisMock.get.mockResolvedValue(null);
      // First call returns empty, second call returns seeded tiers
      prismaMock.businessLoadTier.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockTiers);

      const result = await service.getActiveTiers();

      expect(prismaMock.businessLoadTier.createMany).toHaveBeenCalledWith({
        data: DEFAULT_BUSINESS_LOAD_TIERS,
      });
      expect(result).toEqual(mockTiers);
      expect(redisMock.set).toHaveBeenCalledWith(
        CACHE_KEY_BUSINESS_LOAD_TIERS,
        JSON.stringify(mockTiers),
        CACHE_TTL_ONE_DAY_SECONDS,
      );
    });
  });

  describe('getVendorBusinessLoad', () => {
    beforeEach(() => {
      redisMock.get.mockResolvedValue(JSON.stringify(mockTiers));
    });

    it('should throw BadRequestException if vendorId is missing', async () => {
      await expect(service.getVendorBusinessLoad('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return Normal tier when vendor has 0 active in-progress orders', async () => {
      prismaMock.order.count.mockResolvedValue(0);

      const result = await service.getVendorBusinessLoad('vendor-1');

      expect(result.vendorId).toBe('vendor-1');
      expect(result.activeOrdersCount).toBe(0);
      expect(result.tier?.name).toBe('Normal');
      expect(result.tier?.color).toBe('#22C55E');
      expect(result.tier?.estimatedWaitTimeText).toBe('10-15 mins');
    });

    it('should return Light tier when vendor has 1 active order', async () => {
      prismaMock.order.count.mockResolvedValue(1);

      const result = await service.getVendorBusinessLoad('vendor-1');

      expect(result.activeOrdersCount).toBe(1);
      expect(result.tier?.name).toBe('Light');
      expect(result.tier?.color).toBe('#84CC16');
    });

    it('should return Moderate tier when vendor has 2 active orders', async () => {
      prismaMock.order.count.mockResolvedValue(2);

      const result = await service.getVendorBusinessLoad('vendor-1');

      expect(result.activeOrdersCount).toBe(2);
      expect(result.tier?.name).toBe('Moderate');
      expect(result.tier?.color).toBe('#EAB308');
    });

    it('should return Busy tier when vendor has 3 active orders', async () => {
      prismaMock.order.count.mockResolvedValue(3);

      const result = await service.getVendorBusinessLoad('vendor-1');

      expect(result.activeOrdersCount).toBe(3);
      expect(result.tier?.name).toBe('Busy');
      expect(result.tier?.color).toBe('#F97316');
      expect(result.tier?.estimatedWaitTimeText).toBe('25-35 mins');
    });

    it('should return Heavy tier when vendor has 4 active orders', async () => {
      prismaMock.order.count.mockResolvedValue(4);

      const result = await service.getVendorBusinessLoad('vendor-1');

      expect(result.activeOrdersCount).toBe(4);
      expect(result.tier?.name).toBe('Heavy');
      expect(result.tier?.color).toBe('#EA580C');
    });

    it('should return MAX BUSY tier when vendor has 5 active orders', async () => {
      prismaMock.order.count.mockResolvedValue(5);

      const result = await service.getVendorBusinessLoad('vendor-1');

      expect(result.activeOrdersCount).toBe(5);
      expect(result.tier?.name).toBe('MAX BUSY');
      expect(result.tier?.color).toBe('#DC2626');
      expect(result.tier?.estimatedWaitTimeText).toBe('45+ mins');
    });

    it('should return MAX BUSY tier when vendor has 12 active orders (unbounded)', async () => {
      prismaMock.order.count.mockResolvedValue(12);

      const result = await service.getVendorBusinessLoad('vendor-1');

      expect(result.activeOrdersCount).toBe(12);
      expect(result.tier?.name).toBe('MAX BUSY');
      expect(result.tier?.color).toBe('#DC2626');
    });
  });

  describe('Admin CRUD Operations & Cache Invalidation', () => {
    it('should list all tiers for admin', async () => {
      prismaMock.businessLoadTier.findMany.mockResolvedValue(mockTiers);

      const result = await service.getAllTiersAdmin();

      expect(result).toEqual(mockTiers);
      expect(prismaMock.businessLoadTier.findMany).toHaveBeenCalledWith({
        orderBy: { orderIndex: 'asc' },
      });
    });

    it('should create a new tier and invalidate Redis cache', async () => {
      const newTierDto = {
        name: 'Rush Hour',
        minOrders: 6,
        maxOrders: 8,
        color: '#991B1B',
        estimatedWaitTimeText: '50-60 mins',
        orderIndex: 6,
        isActive: true,
      };

      prismaMock.businessLoadTier.create.mockResolvedValue({
        id: 'tier-6',
        ...newTierDto,
      });

      const result = await service.createTier(newTierDto);

      expect(result.name).toBe('Rush Hour');
      expect(prismaMock.businessLoadTier.create).toHaveBeenCalled();
      expect(redisMock.rem).toHaveBeenCalledWith(CACHE_KEY_BUSINESS_LOAD_TIERS);
    });

    it('should update an existing tier and invalidate Redis cache', async () => {
      prismaMock.businessLoadTier.findUnique.mockResolvedValue(mockTiers[3]);
      prismaMock.businessLoadTier.update.mockResolvedValue({
        ...mockTiers[3],
        name: 'Super Busy',
        color: '#C2410C',
      });

      const result = await service.updateTier('tier-3', {
        name: 'Super Busy',
        color: '#C2410C',
      });

      expect(result.name).toBe('Super Busy');
      expect(prismaMock.businessLoadTier.update).toHaveBeenCalledWith({
        where: { id: 'tier-3' },
        data: { name: 'Super Busy', color: '#C2410C' },
      });
      expect(redisMock.rem).toHaveBeenCalledWith(CACHE_KEY_BUSINESS_LOAD_TIERS);
    });

    it('should throw NotFoundException when updating non-existent tier', async () => {
      prismaMock.businessLoadTier.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTier('invalid-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete an existing tier and invalidate Redis cache', async () => {
      prismaMock.businessLoadTier.findUnique.mockResolvedValue(mockTiers[5]);
      prismaMock.businessLoadTier.delete.mockResolvedValue(mockTiers[5]);

      const result = await service.deleteTier('tier-5');

      expect(result.id).toBe('tier-5');
      expect(prismaMock.businessLoadTier.delete).toHaveBeenCalledWith({
        where: { id: 'tier-5' },
      });
      expect(redisMock.rem).toHaveBeenCalledWith(CACHE_KEY_BUSINESS_LOAD_TIERS);
    });

    it('should throw NotFoundException when deleting non-existent tier', async () => {
      prismaMock.businessLoadTier.findUnique.mockResolvedValue(null);

      await expect(service.deleteTier('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
