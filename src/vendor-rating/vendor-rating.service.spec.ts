import { NotFoundException } from '@nestjs/common';
import { VendorRatingService } from './vendor-rating.service';
import { VendorCategoryType, OrderStatus } from '@prisma/client';

describe('VendorRatingService', () => {
  let service: VendorRatingService;
  let prismaMock: any;
  let redisMock: any;
  let responseServiceMock: any;
  let metadataServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      vendor: {
        findUnique: jest.fn(),
      },
      vendorRating: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue({
          _count: { _all: 5 },
          _avg: { overallRating: 4.8 },
        }),
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      order: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $queryRaw: jest.fn().mockResolvedValue([
        { stars: 5, count: BigInt(4) },
        { stars: 4, count: BigInt(1) },
      ]),
    };

    redisMock = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
    };

    responseServiceMock = {
      successResponse: jest.fn(({ data, message, statusCode, meta }) => ({
        statusCode,
        message,
        data,
        meta,
      })),
    };

    metadataServiceMock = {
      createMetaData: jest.fn(({ totalCount, offset, limit, path, queries }) => ({
        totalCount,
        offset,
        limit,
        path,
        queries,
      })),
    };

    service = new VendorRatingService(
      prismaMock,
      redisMock,
      responseServiceMock,
      metadataServiceMock,
    );
  });

  describe('getVendorRatings - Unified PRODUCT Vendor', () => {
    it('returns overallSummary, paginated reviews with individual customer ratings, and last delivered order (excluding starCounts)', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        vendorType: { id: 'vt-1', name: 'Restaurant', type: VendorCategoryType.PRODUCT },
      });

      prismaMock.vendorRating.findMany.mockResolvedValue([
        {
          id: 'vr-1',
          userId: 'user-c1',
          vendorId: 'vendor-1',
          overallRating: 5,
          ratings: { hygiene: 5, hospitality: 5, speed: 4, foodTaste: 5, valueForMoney: 5 },
          review: 'Delicious biryani!',
          createdAt: new Date('2026-11-20T10:00:00Z'),
          user: {
            id: 'user-c1',
            name: 'Kavitha S',
            imageRef: null,
            relativeUrl: null,
            status: true,
            accountStatus: 'ACTIVE',
          },
        },
      ]);
      prismaMock.vendorRating.count.mockResolvedValue(1);

      prismaMock.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        orderId: 'OD-101',
        orderStatus: OrderStatus.DELIVERED,
        createdAt: new Date(),
      });

      const res = {} as any;
      const result: any = await service.getVendorRatings({
        vendorId: 'vendor-1',
        query: { offset: 0, limit: 10 },
        userId: 'user-c1',
        res,
      });

      expect(result.data.categoryType).toBe(VendorCategoryType.PRODUCT);
      expect(result.data.overallSummary.overallRating).toBe(4.8);
      expect(result.data.overallSummary.totalRatings).toBe(5);
      expect(result.data.overallSummary.starCounts).toBeUndefined();
      expect(result.data.reviews).toHaveLength(1);
      expect(result.data.reviews[0].overallRating).toBe(5);
      expect(result.data.reviews[0].ratings.foodTaste).toBe(5);
      expect(result.data.reviews[0].user.name).toBe('Kavitha S');
      expect(result.data.myLastOrder.orderId).toBe('OD-101');
    });
  });

  describe('getVendorRatings - Unified SERVICE Vendor', () => {
    it('returns overallSummary, reviews, and last completed booking for service vendor', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 'vendor-2',
        vendorType: { id: 'vt-2', name: 'Electrician', type: VendorCategoryType.SERVICE },
      });

      prismaMock.vendorRating.findMany.mockResolvedValue([
        {
          id: 'vr-2',
          userId: 'user-c2',
          vendorId: 'vendor-2',
          overallRating: 4.5,
          ratings: { serviceQuality: 5, serviceSpeed: 4, technicianBehaviour: 5, pricingAndValue: 4, serviceReliability: 5 },
          review: 'Prompt and polite service',
          createdAt: new Date('2026-11-22T10:00:00Z'),
          user: {
            id: 'user-c2',
            name: 'Murugan P',
            imageRef: null,
            relativeUrl: null,
            status: true,
            accountStatus: 'ACTIVE',
          },
        },
      ]);
      prismaMock.vendorRating.count.mockResolvedValue(1);

      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'bk-1',
        bookedId: 'BK-501',
        bookingStatus: OrderStatus.COMPLETED,
        createdAt: new Date(),
        bannerBooking: null,
      });

      const res = {} as any;
      const result: any = await service.getVendorRatings({
        vendorId: 'vendor-2',
        query: { offset: 0, limit: 10 },
        userId: 'user-c2',
        res,
      });

      expect(result.data.categoryType).toBe(VendorCategoryType.SERVICE);
      expect(result.data.reviews[0].ratings.serviceQuality).toBe(5);
      expect(result.data.myLastBooking.bookingId).toBe('BK-501');
    });
  });

  describe('Vendor Not Found', () => {
    it('throws NotFoundException when vendor does not exist', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue(null);

      const res = {} as any;
      await expect(
        service.getVendorRatings({
          vendorId: 'non-existent',
          query: {},
          res,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
