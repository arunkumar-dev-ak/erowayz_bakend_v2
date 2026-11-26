import { Test, TestingModule } from '@nestjs/testing';
import { TrustBadgeService } from './trust-badge.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ResponseService } from '../response/response.service';

describe('TrustBadgeService', () => {
  let service: TrustBadgeService;
  let prismaMock: any;
  let redisMock: any;
  let responseMock: any;

  beforeEach(async () => {
    prismaMock = {
      trustSetting: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      order: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      booking: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      rem: jest.fn(),
    };

    responseMock = {
      successResponse: jest.fn(),
      errorResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustBadgeService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: ResponseService, useValue: responseMock },
      ],
    }).compile();

    service = module.get<TrustBadgeService>(TrustBadgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTrustSettings', () => {
    it('should return cached settings if available in Redis', async () => {
      const cached = { orderThreshold: 15, isActive: true };
      redisMock.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.getTrustSettings();
      expect(result).toEqual(cached);
      expect(prismaMock.trustSetting.findFirst).not.toHaveBeenCalled();
    });

    it('should query DB and cache if not in Redis', async () => {
      redisMock.get.mockResolvedValue(null);
      const dbSetting = { id: 'uuid-1', orderThreshold: 15, isActive: true };
      prismaMock.trustSetting.findFirst.mockResolvedValue(dbSetting);

      const result = await service.getTrustSettings();
      expect(result).toEqual(dbSetting);
      expect(redisMock.set).toHaveBeenCalled();
    });
  });

  describe('isCustomerTrusted', () => {
    it('should return true if cumulative completed orders >= threshold', async () => {
      redisMock.get.mockResolvedValue(
        JSON.stringify({ orderThreshold: 15, isActive: true }),
      );
      prismaMock.order.count.mockResolvedValue(10);
      prismaMock.booking.count.mockResolvedValue(5);

      const isTrusted = await service.isCustomerTrusted('user-1');
      expect(isTrusted).toBe(true);
    });

    it('should return false if cumulative completed orders < threshold', async () => {
      redisMock.get.mockResolvedValue(
        JSON.stringify({ orderThreshold: 15, isActive: true }),
      );
      prismaMock.order.count.mockResolvedValue(9);
      prismaMock.booking.count.mockResolvedValue(5);

      const isTrusted = await service.isCustomerTrusted('user-1');
      expect(isTrusted).toBe(false);
    });

    it('should return false if trust system is inactive', async () => {
      redisMock.get.mockResolvedValue(
        JSON.stringify({ orderThreshold: 15, isActive: false }),
      );
      const isTrusted = await service.isCustomerTrusted('user-1');
      expect(isTrusted).toBe(false);
    });
  });

  describe('getCustomerTrustStats', () => {
    it('should return complete breakdown', async () => {
      redisMock.get.mockResolvedValue(
        JSON.stringify({ orderThreshold: 15, isActive: true }),
      );
      prismaMock.order.count.mockResolvedValue(12);
      prismaMock.booking.count.mockResolvedValue(4);

      const stats = await service.getCustomerTrustStats('user-1');
      expect(stats).toEqual({
        isTrustedCustomer: true,
        totalCompletedOrders: 16,
        ordersCount: 12,
        bookingsCount: 4,
        threshold: 15,
        isActive: true,
      });
    });
  });
});
