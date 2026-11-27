import { NotFoundException } from '@nestjs/common';
import { UnifiedService } from './unified.service';
import { VendorCategoryType, OrderStatus, AccountStatus } from '@prisma/client';

describe('UnifiedService', () => {
  let service: UnifiedService;
  let prismaMock: any;
  let vendorRatingServiceMock: any;
  let responseServiceMock: any;
  let metadataServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      vendor: {
        findUnique: jest.fn(),
      },
      shopWorkingHour: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      category: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      item: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      order: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      serviceOption: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      service: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      banner: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      vendorRating: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };

    vendorRatingServiceMock = {
      getVendorRatingSummary: jest.fn().mockResolvedValue({
        overallRating: 4.5,
        totalRatings: 10,
        categoryType: VendorCategoryType.PRODUCT,
        parameterAverages: {},
      }),
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
      createMetaData: jest.fn(({ totalCount, offset, limit }) => ({
        totalCount,
        offset,
        limit,
      })),
    };

    service = new UnifiedService(
      prismaMock,
      vendorRatingServiceMock,
      responseServiceMock,
      metadataServiceMock,
    );
  });

  describe('getStorefront - PRODUCT vendor', () => {
    it('returns product storefront with categories, items, and last delivered order', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 'vendor-prod-1',
        vendorType: { id: 'vt-1', name: 'Restaurant', type: VendorCategoryType.PRODUCT },
        shopInfo: {
          id: 'shop-1',
          name: 'Tasty Bites',
          nameTamil: null,
          address: 'Main St',
          city: 'Erode',
          pincode: '638001',
          shopImageRef: 'img.jpg',
          relativeUrl: '/img.jpg',
          isShopOpen: true,
          latitude: 11.34,
          longitude: 77.72,
          license: { isLicenseApproved: true },
        },
        vendorServiceOption: [],
        User: {
          id: 'u-1',
          name: 'Owner',
          nameTamil: null,
          imageRef: null,
          relativeUrl: null,
          status: true,
          accountStatus: AccountStatus.ACTIVE,
        },
        favouriteVendorForCustomer: [],
      });

      prismaMock.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Biryani', imageRef: null, relativeUrl: null, vendorTypeId: 'vt-1' },
      ]);

      prismaMock.item.findMany.mockResolvedValue([]);
      prismaMock.item.count.mockResolvedValue(1);

      prismaMock.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        orderId: 'ORD-1001',
        orderStatus: OrderStatus.DELIVERED,
        createdAt: new Date(),
      });

      const res = {} as any;
      const result: any = await service.getStorefront({
        vendorId: 'vendor-prod-1',
        query: { offset: 0, limit: 10 },
        userId: 'user-123',
        res,
      });

      expect(result.data.categoryType).toBe(VendorCategoryType.PRODUCT);
      expect(result.data.vendor.name).toBe('Tasty Bites');
      expect(result.data.categories).toHaveLength(1);
      expect(result.data.categories[0].name).toBe('Biryani');
      expect(result.data.lastDeliveredOrder.orderId).toBe('ORD-1001');
    });
  });

  describe('getStorefront - SERVICE vendor', () => {
    it('returns service storefront with serviceOptions, services, and last completed booking', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 'vendor-serv-1',
        vendorType: { id: 'vt-2', name: 'AC Repair', type: VendorCategoryType.SERVICE },
        shopInfo: {
          id: 'shop-2',
          name: 'Cool AC Services',
          nameTamil: null,
          address: 'Gandhi Road',
          city: 'Salem',
          pincode: '636001',
          shopImageRef: 'ac.jpg',
          relativeUrl: '/ac.jpg',
          isShopOpen: true,
          latitude: 11.66,
          longitude: 78.14,
          license: { isLicenseApproved: true },
        },
        vendorServiceOption: [],
        User: {
          id: 'u-2',
          name: 'Technician',
          nameTamil: null,
          imageRef: null,
          relativeUrl: null,
          status: true,
          accountStatus: AccountStatus.ACTIVE,
        },
        favouriteVendorForCustomer: [],
      });

      prismaMock.serviceOption.findMany.mockResolvedValue([
        { id: 'so-1', name: 'Home Service', tamilName: null, relativeUrl: null, serviceOptImageRef: null, description: null },
      ]);

      prismaMock.service.findMany.mockResolvedValue([
        {
          id: 'srv-1',
          name: 'AC Cleaning',
          serviceImage: [],
          serviceOption: { id: 'so-1', name: 'Home Service', tamilName: null },
          vendorSubService: [{ id: 'sub-1', name: 'Foam Jet', price: 799 }],
        },
      ]);
      prismaMock.service.count.mockResolvedValue(1);

      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'bk-1',
        bookedId: 'BK-2001',
        bookingStatus: OrderStatus.COMPLETED,
        createdAt: new Date(),
        bannerBooking: null,
      });

      const res = {} as any;
      const result: any = await service.getStorefront({
        vendorId: 'vendor-serv-1',
        query: { offset: 0, limit: 10 },
        userId: 'user-123',
        res,
      });

      expect(result.data.categoryType).toBe(VendorCategoryType.SERVICE);
      expect(result.data.vendor.name).toBe('Cool AC Services');
      expect(result.data.serviceOptions).toHaveLength(1);
      expect(result.data.services).toHaveLength(1);
      expect(result.data.services[0].vendorSubService[0].price).toBe(799);
      expect(result.data.lastCompletedBooking.bookingId).toBe('BK-2001');
      expect(result.data.lastCompletedBooking.bookingType).toBe('SERVICE');
    });
  });

  describe('getStorefront - BANNER vendor', () => {
    it('returns banner storefront with banners and last completed banner booking', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 'vendor-ban-1',
        vendorType: { id: 'vt-3', name: 'Mega Offers', type: VendorCategoryType.BANNER },
        shopInfo: {
          id: 'shop-3',
          name: 'Offer World',
          nameTamil: null,
          address: 'Bazaar St',
          city: 'Coimbatore',
          pincode: '641001',
          shopImageRef: 'banner.jpg',
          relativeUrl: '/banner.jpg',
          isShopOpen: true,
          latitude: 11.01,
          longitude: 76.95,
          license: { isLicenseApproved: true },
        },
        vendorServiceOption: [],
        User: {
          id: 'u-3',
          name: 'Promoter',
          nameTamil: null,
          imageRef: null,
          relativeUrl: null,
          status: true,
          accountStatus: AccountStatus.ACTIVE,
        },
        favouriteVendorForCustomer: [],
      });

      prismaMock.banner.findMany.mockResolvedValue([
        {
          id: 'b-1',
          name: 'Flat 50% Off',
          title: 'Mega Deal',
          offerValue: 50,
          bannerItemImages: [],
          productUnit: null,
          keyWordBanner: [],
        },
      ]);
      prismaMock.banner.count.mockResolvedValue(1);

      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'bk-2',
        bookedId: 'BK-5001',
        bookingStatus: OrderStatus.COMPLETED,
        createdAt: new Date(),
        bannerBooking: { id: 'bb-1' },
      });

      const res = {} as any;
      const result: any = await service.getStorefront({
        vendorId: 'vendor-ban-1',
        query: { offset: 0, limit: 10 },
        userId: 'user-123',
        res,
      });

      expect(result.data.categoryType).toBe(VendorCategoryType.BANNER);
      expect(result.data.vendor.name).toBe('Offer World');
      expect(result.data.banners).toHaveLength(1);
      expect(result.data.banners[0].name).toBe('Flat 50% Off');
      expect(result.data.lastCompletedBooking.bookingId).toBe('BK-5001');
      expect(result.data.lastCompletedBooking.bookingType).toBe('BANNER');
    });
  });

  describe('Vendor Not Found', () => {
    it('throws NotFoundException when vendor does not exist', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue(null);

      const res = {} as any;
      await expect(
        service.getStorefront({
          vendorId: 'non-existent',
          query: {},
          res,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
