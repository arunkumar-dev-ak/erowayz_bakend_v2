import { CartService, calculateBannerPrices } from './cart.service';

describe('CartService', () => {
  let cartService: CartService;
  let prismaMock: any;
  let itemServiceMock: any;
  let bannerServiceMock: any;
  let vendorSerOptSerMock: any;
  let responseMock: any;
  let platformFeeServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      $transaction: jest.fn((callback) => callback(prismaMock)),
      cart: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      cartItem: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      cartBanner: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      cartItemVendorServiceOption: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      cartBannerVendorServiceOption: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      banner: {
        findUnique: jest.fn(),
      },
    };

    itemServiceMock = {
      getItemById: jest.fn(),
    };

    bannerServiceMock = {
      findBestBanner: jest.fn().mockResolvedValue({ bestBanner: null, finalTotal: 0 }),
    };

    vendorSerOptSerMock = {
      getVendorServiceOptions: jest.fn(),
    };

    platformFeeServiceMock = {
      getFeesForOrdering: jest.fn().mockResolvedValue({ fee: 5 }),
    };

    responseMock = {
      successResponse: jest.fn(({ data }) => data),
    };

    cartService = new CartService(
      prismaMock,
      responseMock,
      itemServiceMock,
      bannerServiceMock,
      {} as any,
      vendorSerOptSerMock,
      platformFeeServiceMock,
    );
  });

  it('should be defined', () => {
    expect(cartService).toBeDefined();
  });

  describe('calculateBannerPrices', () => {
    it('calculates FLAT discount correctly', () => {
      const banner = {
        offerType: 'FLAT',
        offerValue: 50,
        bannerItems: [
          { quantity: 1, item: { price: 200 } },
          { quantity: 2, item: { price: 50 } },
        ],
      };
      // Base: 200 + 100 = 300, Discount: 50 => 250
      const prices = calculateBannerPrices(banner);
      expect(prices.originalPrice).toBe(300);
      expect(prices.discountedPrice).toBe(250);
    });

    it('calculates PERCENTAGE discount correctly', () => {
      const banner = {
        offerType: 'PERCENTAGE',
        offerValue: 20,
        originalPricePerUnit: 200,
      };
      // Base: 200, 20% discount = 40 => 160
      const prices = calculateBannerPrices(banner);
      expect(prices.originalPrice).toBe(200);
      expect(prices.discountedPrice).toBe(160);
    });

    it('floors prices at 0 when discount exceeds base price (100% discount / free combo)', () => {
      const banner = {
        offerType: 'FLAT',
        offerValue: 500,
        originalPricePerUnit: 200,
      };
      const prices = calculateBannerPrices(banner);
      expect(prices.discountedPrice).toBe(0);
    });
  });

  describe('addCartBanner', () => {
    it('adds a new combo banner to the cart and configures service options', async () => {
      const banner = {
        id: 'ban-1',
        name: 'Duo Combo',
        vendorId: 'ven-1',
        status: 'ACTIVE',
        startDateTime: new Date(Date.now() - 3600000),
        endDateTime: new Date(Date.now() + 3600000),
        qty: 3,
        bannerItems: [],
      };
      prismaMock.banner.findUnique.mockResolvedValue(banner);
      vendorSerOptSerMock.getVendorServiceOptions.mockResolvedValue([{ id: 'vso-takeaway' }]);
      prismaMock.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1', vendorId: 'ven-1' });

      prismaMock.cartBanner.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'cb-1',
          cartId: 'cart-1',
          bannerId: 'ban-1',
          quantity: 1,
          banner,
          cartBannerVendorServiceOption: [],
        });

      prismaMock.cartBanner.create.mockResolvedValue({ id: 'cb-1' });

      const res = {} as any;
      await cartService.addCartBanner({
        userId: 'user-1',
        res,
        body: {
          bannerId: 'ban-1',
          quantity: 1,
          vendorServiceOptionIds: ['vso-takeaway'],
        },
      });

      expect(prismaMock.cartBanner.create).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-1',
          bannerId: 'ban-1',
          quantity: 1,
          cartBannerVendorServiceOption: {
            createMany: {
              data: [{ vendorServiceOptionId: 'vso-takeaway' }],
            },
          },
        },
      });
    });

    it('throws BadRequestException if quantity exceeds max allowed limit', async () => {
      const banner = {
        id: 'ban-1',
        name: 'Duo Combo',
        vendorId: 'ven-1',
        status: 'ACTIVE',
        startDateTime: new Date(Date.now() - 3600000),
        endDateTime: new Date(Date.now() + 3600000),
        qty: 3,
        bannerItems: [],
      };
      prismaMock.banner.findUnique.mockResolvedValue(banner);

      const res = {} as any;
      await expect(
        cartService.addCartBanner({
          userId: 'user-1',
          res,
          body: {
            bannerId: 'ban-1',
            quantity: 5,
            vendorServiceOptionIds: ['vso-takeaway'],
          },
        }),
      ).rejects.toThrow('Quantity cannot exceed maximum allowed limit of 3 for this combo banner');
    });
  });

  describe('updateCartBannerQty', () => {
    it('updates quantity of existing cart banner', async () => {
      const cartBanner = {
        id: 'cb-1',
        cartId: 'cart-1',
        banner: { qty: 5 },
      };
      prismaMock.cartBanner.findFirst.mockResolvedValue(cartBanner);
      prismaMock.cartBanner.update.mockResolvedValue({ ...cartBanner, quantity: 2 });

      const res = {} as any;
      await cartService.updateCartBannerQty({
        userId: 'user-1',
        cartBannerId: 'cb-1',
        body: { quantity: 2 },
        res,
      });

      expect(prismaMock.cartBanner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cb-1' },
          data: { quantity: 2 },
        }),
      );
    });

    it('removes cart banner if quantity is updated to 0', async () => {
      const cartBanner = {
        id: 'cb-1',
        cartId: 'cart-1',
        banner: { qty: 5 },
      };
      prismaMock.cartBanner.findFirst.mockResolvedValue(cartBanner);
      prismaMock.cartBanner.delete.mockResolvedValue({ id: 'cb-1', cartId: 'cart-1' });
      prismaMock.cartItem.count.mockResolvedValue(1);
      prismaMock.cartBanner.count.mockResolvedValue(0);

      const res = {} as any;
      await cartService.updateCartBannerQty({
        userId: 'user-1',
        cartBannerId: 'cb-1',
        body: { quantity: 0 },
        res,
      });

      expect(prismaMock.cartBanner.delete).toHaveBeenCalledWith({
        where: { id: 'cb-1' },
      });
    });
  });

  describe('removeCartBanner', () => {
    it('deletes cart if both cartItems and cartBanners reach 0', async () => {
      const cartBanner = {
        id: 'cb-1',
        cartId: 'cart-1',
        banner: { qty: 5 },
      };
      prismaMock.cartBanner.findFirst.mockResolvedValue(cartBanner);
      prismaMock.cartBanner.delete.mockResolvedValue({ id: 'cb-1', cartId: 'cart-1' });
      prismaMock.cartItem.count.mockResolvedValue(0);
      prismaMock.cartBanner.count.mockResolvedValue(0);

      const res = {} as any;
      await cartService.removeCartBanner({
        userId: 'user-1',
        cartBannerId: 'cb-1',
        res,
      });

      expect(prismaMock.cart.delete).toHaveBeenCalledWith({
        where: { id: 'cart-1' },
      });
    });
  });

  describe('getCartItemByUser', () => {
    it('aggregates stock and prices across both regular cartItems and combo banners', async () => {
      const cart = { id: 'cart-1', vendorId: 'ven-1', vendor: { id: 'ven-1' } };
      prismaMock.cart.findFirst.mockResolvedValue(cart);

      // 1 regular Biryani (price: 180, discount: 160, remainingQty: 10)
      const cartItems = [
        {
          id: 'ci-1',
          cartId: 'cart-1',
          itemId: 'item-biryani',
          quantity: 1,
          item: {
            id: 'item-biryani',
            name: 'Chicken Biryani',
            price: 180,
            discountPrice: 160,
            remainingQty: 10,
            dailyTotalQty: 10,
            minSellingQty: 1,
            productstatus: 'AVAILABLE',
            status: 'ACTIVE',
          },
          cartItemVendorServiceOption: [],
        },
      ];

      // 1 Combo Banner containing 1 Biryani + 2 Raita (price: 199, remainingQty: 10, 20)
      const cartBanners = [
        {
          id: 'cb-1',
          cartId: 'cart-1',
          bannerId: 'ban-combo',
          quantity: 1,
          banner: {
            id: 'ban-combo',
            name: 'Biryani Duo Combo',
            offerType: 'FLAT',
            offerValue: 41,
            originalPricePerUnit: 240,
            qty: 3,
            bannerItems: [
              {
                itemId: 'item-biryani',
                quantity: 1,
                item: {
                  id: 'item-biryani',
                  name: 'Chicken Biryani',
                  price: 180,
                  discountPrice: 160,
                  remainingQty: 10,
                  dailyTotalQty: 10,
                  minSellingQty: 1,
                  productstatus: 'AVAILABLE',
                  status: 'ACTIVE',
                },
              },
              {
                itemId: 'item-raita',
                quantity: 2,
                item: {
                  id: 'item-raita',
                  name: 'Onion Raita',
                  price: 30,
                  discountPrice: 30,
                  remainingQty: 20,
                  dailyTotalQty: 20,
                  minSellingQty: 1,
                  productstatus: 'AVAILABLE',
                  status: 'ACTIVE',
                },
              },
            ],
          },
          cartBannerVendorServiceOption: [],
        },
      ];

      prismaMock.cartItem.findMany.mockResolvedValue(cartItems);
      prismaMock.cartBanner.findMany.mockResolvedValue(cartBanners);
      bannerServiceMock.findBestBanner.mockResolvedValue({
        bestBanner: null,
        finalTotal: 359,
      });

      const res = {} as any;
      await cartService.getCartItemByUser({
        userId: 'user-1',
        cartId: 'cart-1',
        res,
      });

      expect(responseMock.successResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cart: { id: 'cart-1' },
            banners: expect.arrayContaining([
              expect.objectContaining({
                bannerName: 'Biryani Duo Combo',
                unitPrice: 199,
              }),
            ]),
            aggregatedStockSummary: expect.arrayContaining([
              expect.objectContaining({
                itemId: 'item-biryani',
                regularQty: 1,
                comboQty: 1,
                totalQty: 2,
                isStockSufficient: true,
              }),
              expect.objectContaining({
                itemId: 'item-raita',
                regularQty: 0,
                comboQty: 2,
                totalQty: 2,
                isStockSufficient: true,
              }),
            ]),
            regularItemsTotal: 160,
            comboBannersTotal: 199,
            bestPrice: 359,
          }),
        }),
      );
    });
  });

  describe('getAvailableCartData', () => {
    it('aggregates stock requirements and detects insufficient stock', async () => {
      const cartItems = [
        {
          id: 'ci-1',
          itemId: 'item-1',
          quantity: 5,
          item: {
            id: 'item-1',
            name: 'Item 1',
            price: 100,
            discountPrice: 90,
            remainingQty: 6,
            dailyTotalQty: 10,
            productstatus: 'AVAILABLE',
            status: 'ACTIVE',
          },
        },
      ];

      const cartBanners = [
        {
          id: 'cb-1',
          quantity: 2,
          banner: {
            id: 'ban-1',
            name: 'Banner 1',
            status: 'ACTIVE',
            offerType: 'FLAT',
            offerValue: 10,
            bannerItems: [
              {
                itemId: 'item-1',
                quantity: 1,
                item: {
                  id: 'item-1',
                  name: 'Item 1',
                  price: 100,
                  remainingQty: 6,
                  dailyTotalQty: 10,
                },
              },
            ],
          },
        },
      ];

      prismaMock.cartItem.findMany.mockResolvedValue(cartItems);
      prismaMock.cartBanner.findMany.mockResolvedValue(cartBanners);

      // Total required = 5 (regular) + 2*1 (combo) = 7. But available is only 6!
      await expect(
        cartService.getAvailableCartData({ cartId: 'cart-1' }),
      ).rejects.toThrow('Insufficient stock for "Item 1". Required: 7, Available: 6.');
    });
  });
});
