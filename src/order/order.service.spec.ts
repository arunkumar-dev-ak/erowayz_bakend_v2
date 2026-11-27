import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { ItemService } from 'src/item/item.service';
import { BannerService } from 'src/banner/banner.service';
import { VendorServiceOptionService } from 'src/vendor-service-option/vendor-service-option.service';
import { ResponseService } from 'src/response/response.service';
import { CartService } from 'src/cart/cart.service';
import { VendorService } from 'src/vendor/vendor.service';
import { OrderGateway } from 'src/order-gateway/order-gateway.gateway';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { WalletService } from 'src/wallet/wallet.service';
import { EasebuzzService } from 'src/easebuzz/easebuzz.service';
import { ConfigService } from '@nestjs/config';
import { ErrorLogService } from 'src/error-log/error-log.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
import { PlatformFeeService } from 'src/platform-fee/platform-fee.service';
import { OrderStatus, PaymentMethod, Role } from '@prisma/client';

describe('OrderService', () => {
  let service: OrderService;
  let prismaMock: any;
  let cartServiceMock: any;
  let bannerServiceMock: any;
  let responseMock: any;
  let orderGatewayMock: any;
  let firebaseNotificationServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn((callback) => callback(prismaMock)),
      order: {
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      orderItem: {
        findMany: jest.fn(),
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 'oi-1', item: { vendorId: 'ven-1' } }),
      },
      item: {
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      cart: {
        delete: jest.fn(),
      },
      orderSeq: {
        upsert: jest.fn().mockResolvedValue({ lastSeq: 1 }),
      },
      foodPreference: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    cartServiceMock = {
      findCartByUserId: jest.fn(),
      getAvailableCartData: jest.fn(),
    };

    bannerServiceMock = {
      checkIsBannerValid: jest.fn(),
    };

    responseMock = {
      successResponse: jest.fn(({ data }) => data),
    };

    orderGatewayMock = {
      notifyUser: jest.fn(),
    };

    firebaseNotificationServiceMock = {
      sendNotificationToAllSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MetadataService, useValue: {} },
        { provide: ItemService, useValue: {} },
        { provide: BannerService, useValue: bannerServiceMock },
        { provide: VendorServiceOptionService, useValue: {} },
        { provide: ResponseService, useValue: responseMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: VendorService, useValue: {} },
        { provide: OrderGateway, useValue: orderGatewayMock },
        { provide: FirebaseNotificationService, useValue: firebaseNotificationServiceMock },
        { provide: WalletService, useValue: {} },
        { provide: EasebuzzService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn((key) => '3') } },
        { provide: ErrorLogService, useValue: {} },
        {
          provide: VendorSubscriptionService,
          useValue: {
            checkCurrentVendorSubscriptionForPlanFeatures: jest
              .fn()
              .mockResolvedValue({
                planFeatures: { paymentModes: ['CASH', 'JUSPAY', 'COINS'] },
              }),
            findVendorSubscriptionActiveById: jest.fn().mockResolvedValue({
              planFeatures: { paymentModes: ['CASH', 'JUSPAY', 'COINS'] },
            }),
          },
        },
        { provide: PlatformFeeService, useValue: { getFeesForOrdering: jest.fn().mockResolvedValue({ fee: 0 }) } },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCartOrder', () => {
    it('atomically decrements combined stock for regular and combo banner items and creates order in PENDING status', async () => {
      const cart = {
        id: 'cart-1',
        vendorId: 'ven-1',
        vendor: {
          id: 'ven-1',
          userId: 'vendor-user-1',
          shopInfo: { isShopOpen: true, name: 'Vendor Shop' },
          status: 'ACTIVE',
          User: { id: 'vendor-user-1', status: 'ACTIVE' },
        },
      };
      cartServiceMock.findCartByUserId.mockResolvedValue(cart);

      const cartItems = [
        {
          id: 'ci-1',
          itemId: 'item-1',
          quantity: 1,
          item: { id: 'item-1', name: 'Item 1', price: 100 },
          cartItemVendorServiceOption: [{ vendorServiceOptionId: 'vso-1' }],
        },
      ];

      const cartBanners = [
        {
          id: 'cb-1',
          bannerId: 'ban-1',
          quantity: 2,
          banner: {
            id: 'ban-1',
            name: 'Combo Deal',
            offerType: 'FLAT',
            offerValue: 20,
            originalPricePerUnit: 120,
            bannerItems: [
              {
                itemId: 'item-1',
                quantity: 1,
                item: { id: 'item-1', name: 'Item 1', price: 100 },
              },
            ],
          },
          cartBannerVendorServiceOption: [{ vendorServiceOptionId: 'vso-1' }],
        },
      ];

      cartServiceMock.getAvailableCartData.mockResolvedValue({
        totals: { total: 340, discountTotal: 300 },
        cartItems,
        cartBanners,
        aggregatedRequirements: [
          {
            itemId: 'item-1',
            itemName: 'Item 1',
            regularQty: 1,
            comboQty: 2,
            totalRequiredQty: 3,
            item: { id: 'item-1', remainingQty: 10, dailyTotalQty: 10 },
          },
        ],
      });

      // Atomic conditional update succeeds
      prismaMock.item.updateMany.mockResolvedValue({ count: 1 });

      const createdOrder = {
        id: 'ord-uuid-1',
        orderId: 'OD-2026-0001',
        orderStatus: 'PENDING',
        totalPrice: 340,
        finalPayableAmount: 300,
        preferredPaymentMethod: 'CASH',
        orderedUser: { name: 'Customer' },
      };
      prismaMock.order.create.mockResolvedValue(createdOrder);

      const res = {} as any;
      await service.handleCartOrder({
        userId: 'user-1',
        cartId: 'cart-1',
        preferredPaymentMethod: PaymentMethod.CASH,
        res,
      });

      // Verify atomic conditional stock decrement
      expect(prismaMock.item.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'item-1',
          remainingQty: { gte: 3 },
        },
        data: {
          remainingQty: { decrement: 3 },
        },
      });

      // Verify order created with OrderBanner data
      expect(prismaMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderBanners: {
              create: [
                {
                  bannerId: 'ban-1',
                  bannerName: 'Combo Deal',
                  quantity: 2,
                  discountApplied: 40,
                },
              ],
            },
          }),
        }),
      );
    });

    it('throws ConflictException and rolls back if atomic decrement returns count: 0 (insufficient stock)', async () => {
      const cart = {
        id: 'cart-1',
        vendorId: 'ven-1',
        vendor: {
          id: 'ven-1',
          userId: 'vendor-user-1',
          shopInfo: { isShopOpen: true, name: 'Vendor Shop' },
          status: 'ACTIVE',
          User: { id: 'vendor-user-1', status: 'ACTIVE' },
        },
      };
      cartServiceMock.findCartByUserId.mockResolvedValue(cart);

      cartServiceMock.getAvailableCartData.mockResolvedValue({
        totals: { total: 100, discountTotal: 100 },
        cartItems: [],
        cartBanners: [],
        aggregatedRequirements: [
          {
            itemId: 'item-1',
            itemName: 'Biryani',
            regularQty: 0,
            comboQty: 2,
            totalRequiredQty: 2,
            item: { id: 'item-1', remainingQty: 1, dailyTotalQty: 10 },
          },
        ],
      });

      // Another transaction bought the remaining stock concurrently -> count: 0
      prismaMock.item.updateMany.mockResolvedValue({ count: 0 });

      const res = {} as any;
      await expect(
        service.handleCartOrder({
          userId: 'user-1',
          cartId: 'cart-1',
          preferredPaymentMethod: PaymentMethod.CASH,
          res,
        }),
      ).rejects.toThrow('Apologies, "Biryani" does not have sufficient stock. Required: 2. Please adjust your cart.');
    });
  });

  describe('changeStatus - Feature 04: 20-min COD cancellation timer', () => {
    it('blocks vendor from cancelling an IN_PROGRESS COD order if less than 19:30 mins have elapsed from createdAt', async () => {
      const createdAt = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      const existingOrder = {
        id: 'ord-1',
        orderId: 'OD-2026-0001',
        orderStatus: OrderStatus.IN_PROGRESS,
        preferredPaymentMethod: PaymentMethod.CASH,
        userId: 'customer-1',
        createdAt,
        expiryAt: new Date(Date.now() + 60 * 1000),
        orderItems: [
          {
            itemId: 'item-1',
            orderItemVendorServiceOption: [
              {
                vendorServiceOption: {
                  vendorId: 'ven-1',
                  vendor: {
                    id: 'ven-1',
                    userId: 'vendor-user-1',
                    User: { id: 'vendor-user-1' },
                  },
                },
              },
            ],
          },
        ],
      };

      prismaMock.order.findFirst.mockResolvedValue(existingOrder);

      const currentUser = {
        id: 'vendor-user-1',
        role: Role.VENDOR,
        vendor: { id: 'ven-1', userId: 'vendor-user-1' },
      } as any;

      const res = {} as any;
      await expect(
        service.changeStatus({
          orderId: 'ord-1',
          currentUser,
          body: { orderStatus: OrderStatus.CANCELLED },
          res,
        }),
      ).rejects.toThrow(
        'Cash on Delivery (COD) orders can only be cancelled after 19 minutes and 30 seconds from order creation',
      );
    });

    it('allows vendor to cancel an IN_PROGRESS COD order after 19:30 mins have elapsed from createdAt', async () => {
      const createdAt = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
      const existingOrder = {
        id: 'ord-1',
        orderId: 'OD-2026-0001',
        orderStatus: OrderStatus.IN_PROGRESS,
        preferredPaymentMethod: PaymentMethod.CASH,
        userId: 'customer-1',
        createdAt,
        expiryAt: new Date(Date.now() + 60 * 1000),
        finalPayableAmount: 100,
        orderPayment: null,
        orderItems: [
          {
            itemId: 'item-1',
            quantity: 1,
            item: { id: 'item-1', remainingQty: 5, dailyTotalQty: 10 },
            orderItemVendorServiceOption: [
              {
                vendorServiceOption: {
                  vendorId: 'ven-1',
                  vendor: {
                    id: 'ven-1',
                    userId: 'vendor-user-1',
                    User: { id: 'vendor-user-1' },
                  },
                },
              },
            ],
          },
        ],
      };

      prismaMock.order.findFirst.mockResolvedValue(existingOrder);
      prismaMock.orderItem.findMany.mockResolvedValue([
        {
          itemId: 'item-1',
          quantity: 1,
          item: { id: 'item-1', remainingQty: 5, dailyTotalQty: 10 },
          order: {
            preferredPaymentMethod: PaymentMethod.CASH,
            finalPayableAmount: 100,
            orderPayment: null,
          },
        },
      ]);
      prismaMock.order.update.mockResolvedValue({
        ...existingOrder,
        orderStatus: OrderStatus.CANCELLED,
      });
      prismaMock.item.update.mockResolvedValue({});

      const currentUser = {
        id: 'vendor-user-1',
        role: Role.VENDOR,
        vendor: { id: 'ven-1', userId: 'vendor-user-1' },
      } as any;

      const res = {} as any;
      await service.changeStatus({
        orderId: 'ord-1',
        currentUser,
        body: { orderStatus: OrderStatus.CANCELLED },
        res,
      });

      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-1' },
          data: expect.objectContaining({ orderStatus: 'CANCELLED' }),
        }),
      );
    });

    it('allows vendor to decline a PENDING COD order immediately without waiting', async () => {
      const createdAt = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
      const existingOrder = {
        id: 'ord-1',
        orderId: 'OD-2026-0001',
        orderStatus: OrderStatus.PENDING,
        preferredPaymentMethod: PaymentMethod.CASH,
        userId: 'customer-1',
        createdAt,
        expiryAt: new Date(Date.now() + 60 * 1000),
        finalPayableAmount: 100,
        orderPayment: null,
        orderItems: [
          {
            itemId: 'item-1',
            quantity: 1,
            item: { id: 'item-1', remainingQty: 5, dailyTotalQty: 10 },
            orderItemVendorServiceOption: [
              {
                vendorServiceOption: {
                  vendorId: 'ven-1',
                  vendor: {
                    id: 'ven-1',
                    userId: 'vendor-user-1',
                    User: { id: 'vendor-user-1' },
                  },
                },
              },
            ],
          },
        ],
      };

      prismaMock.order.findFirst.mockResolvedValue(existingOrder);
      prismaMock.orderItem.findMany.mockResolvedValue([
        {
          itemId: 'item-1',
          quantity: 1,
          item: { id: 'item-1', remainingQty: 5, dailyTotalQty: 10 },
          order: {
            preferredPaymentMethod: PaymentMethod.CASH,
            finalPayableAmount: 100,
            orderPayment: null,
          },
        },
      ]);
      prismaMock.order.update.mockResolvedValue({
        ...existingOrder,
        orderStatus: OrderStatus.CANCELLED,
      });
      prismaMock.item.update.mockResolvedValue({});

      const currentUser = {
        id: 'vendor-user-1',
        role: Role.VENDOR,
        vendor: { id: 'ven-1', userId: 'vendor-user-1' },
      } as any;

      const res = {} as any;
      await service.changeStatus({
        orderId: 'ord-1',
        currentUser,
        body: { orderStatus: OrderStatus.CANCELLED },
        res,
      });

      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-1' },
          data: expect.objectContaining({ orderStatus: 'CANCELLED' }),
        }),
      );
    });
  });
});
