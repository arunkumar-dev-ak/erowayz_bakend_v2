import { NotFoundException } from '@nestjs/common';
import { HomeApiService } from './home-api.service';
import { VendorCategoryType } from '@prisma/client';

describe('HomeApiService', () => {
  let service: HomeApiService;
  let prismaMock: any;
  let responseMock: any;
  let metadataMock: any;
  let redisMock: any;

  beforeEach(() => {
    prismaMock = {
      vendor: {
        findUnique: jest.fn(),
      },
      wallet: {
        findUnique: jest.fn(),
      },
      vendorSubscription: {
        findFirst: jest.fn(),
      },
      vendorRating: {
        aggregate: jest.fn().mockResolvedValue({
          _count: { _all: 10 },
          _avg: { overallRating: 4.5 },
        }),
      },
      order: {
        count: jest.fn().mockResolvedValue(5),
      },
      orderItemVendorServiceOption: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
      vendorServiceOption: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };

    responseMock = {
      successResponse: jest.fn(({ data, message, statusCode }) => ({
        statusCode,
        message,
        data,
      })),
    };

    metadataMock = {
      createMetaData: jest.fn(),
    };

    redisMock = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
    };

    service = new HomeApiService(
      prismaMock,
      responseMock,
      metadataMock,
      redisMock,
    );
  });

  describe('getVendorDashboard', () => {
    it('retrieves consolidated dashboard for a VENDOR', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 'vendor-123',
        userId: 'user-vendor-1',
        vendorType: { id: 'vt-1', name: 'Food Truck', type: VendorCategoryType.PRODUCT },
        shopInfo: { id: 'shop-1', name: 'Tasty Food', isShopOpen: true, address: 'Erode' },
        User: { id: 'user-vendor-1', name: 'Chef John', email: 'chef@food.com', mobile: '9000000001' },
      });

      prismaMock.wallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        userId: 'user-vendor-1',
        balance: 500,
        lockedBalance: 50,
        locked: false,
        user: {
          vendor: {
            adminVendorCredit: { totalGiven: 1000, totalRefunded: 50 },
          },
        },
      });

      prismaMock.vendorSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        planId: 'plan-gold',
        planName: 'Gold Plan',
        planBillingPeriod: 'MONTHLY',
        planPrice: 999,
        planDiscountPrice: 899,
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-01'),
        isActive: true,
        planFeatures: { maxProducts: 50 },
      });

      const res = {} as any;
      const result: any = await service.getVendorDashboard({
        vendorId: 'vendor-123',
        walletOwnerUserId: 'user-vendor-1',
        isStaff: false,
        res,
      });

      expect(prismaMock.vendor.findUnique).toHaveBeenCalledWith({
        where: { id: 'vendor-123' },
        include: expect.any(Object),
      });
      expect(prismaMock.wallet.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-vendor-1' },
        include: expect.any(Object),
      });
      expect(result.data.vendor.shopName).toBe('Tasty Food');
      expect(result.data.vendor.isStaff).toBe(false);
      expect(result.data.wallet.balance).toBe(500);
      expect(result.data.wallet.adminVendorCredit.totalGiven).toBe(1000);
      expect(result.data.wallet.adminVendorCredit.availableCredit).toBe(950);
      expect(result.data.currentSubscription.planName).toBe('Gold Plan');
      expect(result.data.barChart.totalOrders).toBe(5);
    });

    it('retrieves dashboard for STAFF mapping to parent vendor wallet', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 'vendor-123',
        userId: 'parent-vendor-user-id',
        vendorType: { id: 'vt-1', name: 'Service Vendor', type: VendorCategoryType.SERVICE },
        shopInfo: { id: 'shop-2', name: 'AC Care', isShopOpen: true, address: 'Salem' },
        User: { id: 'parent-vendor-user-id', name: 'Owner AC', email: 'owner@ac.com', mobile: '9000000003' },
      });

      prismaMock.wallet.findUnique.mockResolvedValue({
        id: 'wallet-parent',
        userId: 'parent-vendor-user-id',
        balance: 1200,
        lockedBalance: 0,
        locked: false,
        user: { vendor: { adminVendorCredit: null } },
      });

      const res = {} as any;
      const result: any = await service.getVendorDashboard({
        vendorId: 'vendor-123',
        walletOwnerUserId: 'parent-vendor-user-id',
        isStaff: true,
        res,
      });

      expect(result.data.vendor.isStaff).toBe(true);
      expect(result.data.wallet.balance).toBe(1200);
      expect(prismaMock.wallet.findUnique).toHaveBeenCalledWith({
        where: { userId: 'parent-vendor-user-id' },
        include: expect.any(Object),
      });
    });

    it('throws NotFoundException when vendor does not exist', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue(null);

      const res = {} as any;
      await expect(
        service.getVendorDashboard({
          vendorId: 'non-existent-vendor',
          walletOwnerUserId: 'user-1',
          isStaff: false,
          res,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBarChartData (Legacy)', () => {
    it('executes legacy bar chart data fetching without error', async () => {
      const res = {} as any;
      const body = {
        startDateTime: new Date('2026-11-01T00:00:00.000Z'),
        endDateTime: new Date('2026-11-20T00:00:00.000Z'),
      };

      const result: any = await service.getBarChartData({
        vendorId: 'vendor-123',
        res,
        body,
      });

      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('BarChart fetched Successfully');
      expect(result.data.totalOrders).toBe(5);
    });
  });
});
