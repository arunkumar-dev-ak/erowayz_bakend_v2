import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { AddCartDto } from './dto/add-cart.dto';
import { AddCartBannerDto } from './dto/add-cart-banner.dto';
import { UpdateCartBannerQtyDto } from './dto/update-cart-banner-qty.dto';
import { ItemService } from 'src/item/item.service';
import { Response } from 'express';
import { UpdateCartDto } from './dto/update-cart.dto';
import { BannerService } from 'src/banner/banner.service';
import { Cart, OfferType } from '@prisma/client';
import { MetadataService } from 'src/metadata/metadata.service';
import { VendorServiceOptionService } from 'src/vendor-service-option/vendor-service-option.service';
import { UpdateCartServiceDto } from './dto/update-cart-service.dto';
import { BestOfferItemDto } from './dto/bestoffer-item.dto';
import { calculateBestPriceForItem } from './utils/cart.utils';
import { CartItemWithItem } from './utils/cartItem_raw_types.utils';
import { PlatformFeeService } from 'src/platform-fee/platform-fee.service';

export function calculateBannerPrices(banner: {
  offerType: string;
  offerValue: number;
  originalPricePerUnit?: number | null;
  bannerItems?: Array<{
    quantity: number;
    item?: { price: number; discountPrice?: number | null } | null;
  }> | null;
}): { originalPrice: number; discountedPrice: number } {
  let basePrice = 0;
  if (banner.originalPricePerUnit && banner.originalPricePerUnit > 0) {
    basePrice = banner.originalPricePerUnit;
  } else if (banner.bannerItems && banner.bannerItems.length > 0) {
    basePrice = banner.bannerItems.reduce(
      (sum, bi) => sum + (bi.item?.price ?? 0) * (bi.quantity ?? 1),
      0,
    );
  }

  let discount = 0;
  if (banner.offerType === 'FLAT') {
    discount = banner.offerValue;
  } else if (banner.offerType === 'PERCENTAGE') {
    discount = Math.round((banner.offerValue / 100) * basePrice);
  }

  const discountedPrice = Math.max(0, basePrice - discount);
  return {
    originalPrice: basePrice,
    discountedPrice,
  };
}

type CartTotals = {
  total: number;
  discountTotal: number;
};

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly itemService: ItemService,
    private readonly bannerService: BannerService,
    private readonly metaDataService: MetadataService,
    private readonly vendorSerOptSer: VendorServiceOptionService,
    private readonly platformFeeService: PlatformFeeService,
  ) {}

  async getCartItemByUser({
    res,
    userId,
    cartId,
  }: {
    res: Response;
    userId: string;
    cartId?: string;
  }) {
    const initialDate = new Date();
    const cart = cartId
      ? await this.findCartByUserId(userId, cartId)
      : await this.findFirstCartByUser(userId);

    if (!cart) {
      if (cartId) {
        throw new NotFoundException(
          'Cart not found or not associated with the User',
        );
      }
      return this.response.successResponse({
        initialDate,
        res,
        message: 'Cart Items fetched Successfully',
        data: [],
        statusCode: 200,
      });
    }

    const [cartItems, cartBanners] = await Promise.all([
      this.prisma.cartItem.findMany({
        where: {
          cartId: cart.id,
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              discountPrice: true,
              productUnit: true,
              remainingQty: true,
              dailyTotalQty: true,
              minSellingQty: true,
              productstatus: true,
              status: true,
              itemImage: true,
            },
          },
          cartItemVendorServiceOption: {
            include: {
              vendorServiceOption: {
                include: {
                  serviceOption: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.cartBanner.findMany({
        where: {
          cartId: cart.id,
        },
        include: {
          banner: {
            include: {
              bannerItems: {
                include: {
                  item: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      price: true,
                      discountPrice: true,
                      productUnit: true,
                      remainingQty: true,
                      dailyTotalQty: true,
                      minSellingQty: true,
                      productstatus: true,
                      status: true,
                      itemImage: true,
                    },
                  },
                },
              },
              bannerItemImages: true,
            },
          },
          cartBannerVendorServiceOption: {
            include: {
              vendorServiceOption: {
                include: {
                  serviceOption: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let regularItemsTotal = 0;
    let regularItemsDiscountTotal = 0;
    for (const ci of cartItems) {
      const price = ci.item.price;
      const discountPrice = ci.item.discountPrice ?? price;
      regularItemsTotal += ci.quantity * price;
      regularItemsDiscountTotal += ci.quantity * discountPrice;
    }

    let comboBannersTotal = 0;
    let comboBannersDiscountTotal = 0;

    const formattedBanners = cartBanners.map((cb) => {
      const prices = calculateBannerPrices(cb.banner);
      const originalTotalPrice = cb.quantity * prices.originalPrice;
      const discountedTotalPrice = cb.quantity * prices.discountedPrice;
      comboBannersTotal += originalTotalPrice;
      comboBannersDiscountTotal += discountedTotalPrice;

      const comboItems = (cb.banner.bannerItems || []).map((bi) => ({
        itemId: bi.itemId,
        name: bi.item?.name,
        quantityPerCombo: bi.quantity,
        totalQuantity: cb.quantity * bi.quantity,
        price: bi.item?.price ?? 0,
        discountPrice: bi.item?.discountPrice ?? bi.item?.price ?? 0,
        item: bi.item,
      }));

      const serviceOptions = cb.cartBannerVendorServiceOption
        .map((cbvso) => cbvso.vendorServiceOption?.serviceOption)
        .filter(Boolean);

      return {
        cartBannerId: cb.id,
        id: cb.id,
        bannerId: cb.bannerId,
        bannerName: cb.banner.name,
        quantity: cb.quantity,
        maxQuantityLimit: cb.banner.qty ? Math.min(cb.banner.qty, 10) : 3,
        unitPrice: prices.discountedPrice,
        totalPrice: discountedTotalPrice,
        originalUnitPrice: prices.originalPrice,
        originalTotalPrice,
        serviceOptions,
        comboItems,
        banner: {
          ...cb.banner,
          originalPrice: prices.originalPrice,
          discountedPrice: prices.discountedPrice,
        },
        cartBannerVendorServiceOption: cb.cartBannerVendorServiceOption,
      };
    });

    const stockMap = new Map<
      string,
      {
        itemId: string;
        name: string;
        regularQty: number;
        comboQty: number;
        totalQty: number;
        remainingStock: number;
        dailyTotalStock: number;
        isStockSufficient: boolean;
      }
    >();

    for (const ci of cartItems) {
      const existing = stockMap.get(ci.itemId) || {
        itemId: ci.itemId,
        name: ci.item.name,
        regularQty: 0,
        comboQty: 0,
        totalQty: 0,
        remainingStock: ci.item.remainingQty,
        dailyTotalStock: ci.item.dailyTotalQty,
        isStockSufficient: true,
      };
      existing.regularQty += ci.quantity;
      existing.totalQty += ci.quantity;
      stockMap.set(ci.itemId, existing);
    }

    for (const cb of cartBanners) {
      if (cb.banner.bannerItems) {
        for (const bi of cb.banner.bannerItems) {
          if (!bi.item) continue;
          const existing = stockMap.get(bi.itemId) || {
            itemId: bi.itemId,
            name: bi.item.name,
            regularQty: 0,
            comboQty: 0,
            totalQty: 0,
            remainingStock: bi.item.remainingQty,
            dailyTotalStock: bi.item.dailyTotalQty,
            isStockSufficient: true,
          };
          const addedQty = cb.quantity * bi.quantity;
          existing.comboQty += addedQty;
          existing.totalQty += addedQty;
          stockMap.set(bi.itemId, existing);
        }
      }
    }

    const aggregatedStockSummary = Array.from(stockMap.values()).map(
      (stock) => {
        const isSufficient =
          stock.remainingStock >= stock.totalQty &&
          stock.dailyTotalStock >= stock.totalQty;
        return {
          ...stock,
          isStockSufficient: isSufficient,
        };
      },
    );

    const totalAmount = Math.max(0, regularItemsTotal + comboBannersTotal);
    const discountedAmount = Math.max(
      0,
      regularItemsDiscountTotal + comboBannersDiscountTotal,
    );

    const { bestBanner, finalTotal } = await this.bannerService.findBestBanner(
      totalAmount,
      cart.vendorId,
    );

    const bestPrice = Math.max(0, Math.min(finalTotal, discountedAmount));

    const platformFee = await this.platformFeeService.getFeesForOrdering({
      amount: bestPrice,
    });

    return this.response.successResponse({
      initialDate,
      res,
      statusCode: 200,
      message: 'CartItems fetched Successfully',
      data: {
        cart: { id: cart.id },
        cartItems,
        banners: formattedBanners,
        aggregatedStockSummary,
        regularItemsTotal: regularItemsDiscountTotal,
        comboBannersTotal: comboBannersDiscountTotal,
        grossTotal: totalAmount,
        totalAmount,
        bestPrice,
        platformFee: platformFee ? platformFee.fee : 0,
        finalPayableAmount: Math.max(
          0,
          bestPrice + (platformFee ? platformFee.fee : 0),
        ),
        vendor: cart.vendor,
        offerAppliedBanner:
          bestBanner && bestPrice === finalTotal ? bestBanner : null,
      },
    });
  }

  async getAllCartsByUser({
    res,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    offset: number;
    limit: number;
    userId: string;
  }) {
    const initialDate = new Date();

    const totalCount = await this.prisma.cart.count({
      where: {
        userId,
      },
    });

    const cart = await this.prisma.cart.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        vendor: {
          select: {
            id: true,
            shopInfo: {
              select: {
                id: true,
                name: true,
                address: true,
                shopCategory: true,
                shopCity: true,
                shopImageRef: true,
                isShopOpen: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    });
    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `cart/${userId}`,
    });

    return this.response.successResponse({
      initialDate,
      res,
      meta,
      data: cart,
      message: 'Cart fetched Successfully',
      statusCode: 200,
    });
  }

  async getCartItemById({
    res,
    cartItemId,
  }: {
    res: Response;
    cartItemId: string;
  }) {
    const initialDate = new Date();
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
      },
    });

    return this.response.successResponse({
      res,
      initialDate,
      message: 'CartItem fetched Successfully',
      statusCode: 200,
      data: cartItem,
    });
  }

  async getBestOfferForItem({
    res,
    body,
  }: {
    res: Response;
    body: BestOfferItemDto;
  }) {
    const initialDate = new Date();
    const { itemId, quantity } = body;
    const item = await this.itemService.getItemById(itemId);
    //check item, inactive,remaining quantity,
    if (!item) {
      throw new BadRequestException(
        'Apologies for the reason, The requested item not found',
      );
    } else if (item.status === 'INACTIVE') {
      throw new BadRequestException(
        'Apologies for the reason, The requested item is currently not active',
      );
    } else if (item.remainingQty < quantity) {
      throw new BadRequestException(
        'Insufficient stock: The requested quantity is not available.',
      );
    }

    const totalAmount = quantity * item.price;
    const discountedAmount = item.discountPrice
      ? quantity * item.discountPrice
      : totalAmount;
    const { bestBanner, finalTotal } = await this.bannerService.findBestBanner(
      totalAmount,
      item.vendorId,
    );

    const { bestPrice, bannerApplied } = calculateBestPriceForItem({
      totalAmount,
      discountedAmount,
      banner: bestBanner,
      bannerDiscountedAmount: finalTotal,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: {
        totalAmount,
        bestPrice,
        item,
        appliedBanner: bannerApplied ? bestBanner : null,
      },
      statusCode: 200,
      message: 'Items price fetched successfulyy',
    });
  }

  async addCartItem({
    userId,
    body,
    res,
  }: {
    userId: string;
    body: AddCartDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { itemId, totalQty, vendorServiceOptionIds } = body;
    //check item present
    const item = await this.itemService.getItemById(itemId);
    if (!item) {
      throw new NotFoundException('Item Not Found');
    } else if (totalQty < item.minSellingQty) {
      throw new ConflictException(
        'Total Quantity is less than Minimum Selling Quantity',
      );
    }

    const vendorId = item.vendorId;

    //check serviceOptionId is associated with Vendor
    const vendorServiceOption =
      await this.vendorSerOptSer.getVendorServiceOptions({
        vendorId,
        vendorServicesIds: vendorServiceOptionIds,
      });
    if (vendorServiceOption.length !== vendorServiceOptionIds.length) {
      throw new BadRequestException(
        'Some of the ServiceOption is not found not associated with the Vendor',
      );
    }

    //Get Cart or Create Cart
    const cart = await this.findOrCreateCartByUserId(userId, vendorId);

    //Create item or update qty and service options
    const cartItem = await this.prisma.$transaction(async (tx) => {
      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          cartId_itemId: {
            cartId: cart.id,
            itemId,
          },
        },
      });

      let cartItemId: string;

      if (existingCartItem) {
        // Update quantity
        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: totalQty,
          },
        });

        // Update service options: replace with newly provided vendorServiceOptionIds
        await tx.cartItemVendorServiceOption.deleteMany({
          where: {
            cartItemId: existingCartItem.id,
          },
        });

        await tx.cartItemVendorServiceOption.createMany({
          data: vendorServiceOptionIds.map((id) => ({
            cartItemId: existingCartItem.id,
            vendorServiceOptionId: id,
          })),
        });

        cartItemId = existingCartItem.id;
      } else {
        const created = await tx.cartItem.create({
          data: {
            cartId: cart.id,
            quantity: totalQty,
            itemId: item.id,
            cartItemVendorServiceOption: {
              createMany: {
                data: vendorServiceOptionIds.map((id) => ({
                  vendorServiceOptionId: id,
                })),
              },
            },
          },
        });
        cartItemId = created.id;
      }

      return await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          item: true,
          cartItemVendorServiceOption: {
            include: {
              vendorServiceOption: {
                include: {
                  serviceOption: true,
                },
              },
            },
          },
        },
      });
    });

    this.response.successResponse({
      message: 'CartItems Added Successfully',
      initialDate,
      res,
      data: cartItem,
      statusCode: 200,
    });
  }

  async updateCartItemQty({
    userId,
    cartItemId,
    body,
    res,
  }: {
    userId: string;
    cartItemId: string;
    body: UpdateCartDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const cartItem = await this.findCartItemByUser(userId, cartItemId);
    if (!cartItem) {
      throw new NotFoundException(
        'Item not found or Item is not associated with the User',
      );
    } else if (body.totalQty < cartItem.item.minSellingQty) {
      throw new ConflictException(
        'Total Quantity is less than Minimum Selling Quantity',
      );
    }
    const updatedCartItem = await this.prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        quantity: body.totalQty,
      },
      include: {
        item: true,
      },
    });
    return this.response.successResponse({
      initialDate,
      res,
      message: 'Quantity updated Successfully',
      data: updatedCartItem,
      statusCode: 200,
    });
  }

  async updateCartItemService({
    res,
    userId,
    cartItemId,
    body,
  }: {
    res: Response;
    userId: string;
    cartItemId: string;
    body: UpdateCartServiceDto;
  }) {
    const initialDate = new Date();
    const cartItem = await this.findCartItemByUser(userId, cartItemId);
    if (!cartItem) {
      throw new NotFoundException(
        'Item not found or Item is not associated with the User',
      );
    }
    const vendorId = cartItem.item.vendorId;

    //check new serviceOptionId is associated with Vendor
    const vendorServiceOption =
      await this.vendorSerOptSer.getVendorServiceOptions({
        vendorId,
        vendorServicesIds: body.vendorServiceOptionIds,
      });
    if (vendorServiceOption.length !== body.vendorServiceOptionIds.length) {
      throw new BadRequestException(
        'ServiceOption is not found or not associated with the Vendor',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.cartItemVendorServiceOption.deleteMany({
        where: {
          cartItemId: cartItem.id,
        },
      });

      const updatedCartItem = await tx.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          cartItemVendorServiceOption: {
            createMany: {
              data: body.vendorServiceOptionIds.map((id) => ({
                vendorServiceOptionId: id,
              })),
            },
          },
        },
        include: {
          cartItemVendorServiceOption: {
            include: {
              vendorServiceOption: {
                include: {
                  serviceOption: true,
                },
              },
            },
          },
        },
      });

      return updatedCartItem;
    });

    return this.response.successResponse({
      res,
      initialDate,
      message: 'Service Option changed successfully',
      data: result,
      statusCode: 200,
    });
  }

  async removeCartItem({
    res,
    userId,
    cartItemId,
  }: {
    res: Response;
    userId: string;
    cartItemId: string;
  }) {
    const initialDate = new Date();

    const cartItem = await this.findCartItemByUser(userId, cartItemId);
    if (!cartItem) {
      throw new NotFoundException(
        'CartItem is not found or not associated with the User',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const removedCartItem = await tx.cartItem.delete({
        where: {
          id: cartItem.id,
        },
      });
      //delete the cart if item count and banner count are both 0
      const [cartItemCount, cartBannerCount] = await Promise.all([
        tx.cartItem.count({
          where: {
            cartId: removedCartItem.cartId,
          },
        }),
        tx.cartBanner.count({
          where: {
            cartId: removedCartItem.cartId,
          },
        }),
      ]);
      if (cartItemCount === 0 && cartBannerCount === 0) {
        await tx.cart.delete({
          where: {
            id: removedCartItem.cartId,
          },
        });
      }
      return removedCartItem;
    });

    return this.response.successResponse({
      res,
      initialDate,
      message: 'Card Item removed successfully',
      statusCode: 200,
      data: result,
    });
  }

  /*----- Helper Functions -----*/
  async findCartByUserId(userId: string, cartId: string) {
    return await this.prisma.cart.findFirst({
      where: {
        userId,
        id: cartId,
      },
      include: {
        vendor: {
          include: {
            shopInfo: {
              include: {
                shopCategory: true,
                shopCity: true,
              },
            },
            User: true,
          },
        },
      },
    });
  }

  async findFirstCartByUser(userId: string) {
    return await this.prisma.cart.findFirst({
      where: {
        userId,
      },
      include: {
        vendor: {
          include: {
            shopInfo: {
              include: {
                shopCategory: true,
                shopCity: true,
              },
            },
          },
        },
      },
    });
  }

  async findOrCreateCartByUserId(userId: string, vendorId: string) {
    let cart: Cart | null;
    cart = await this.prisma.cart.findUnique({
      where: {
        userId_vendorId: {
          userId,
          vendorId,
        },
      },
    });
    if (!cart) {
      cart = await this.createCartByUserId(userId, vendorId);
    }
    return cart;
  }

  async createCartByUserId(userId: string, vendorId: string) {
    return await this.prisma.cart.create({
      data: {
        userId,
        vendorId,
      },
    });
  }

  async findCartItemByUser(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: userId,
        },
      },
      include: {
        item: true,
      },
    });

    return cartItem;
  }

  async getAvailableCartItemsWithPrice({
    cartId,
  }: {
    cartId: string;
  }): Promise<{
    totals: CartTotals;
    cartItems: CartItemWithItem[];
  }> {
    const [totals, cartItems] = await Promise.all([
      this.prisma.$queryRaw<CartTotals[]>`
  SELECT
    SUM("i"."price" * "ci"."quantity") AS total,
    SUM(COALESCE("i"."discountPrice", "i"."price") * "ci"."quantity") AS "discountTotal"
  FROM "CartItem" AS "ci"
  INNER JOIN "Item" AS "i" ON "i"."id" = "ci"."itemId"
  INNER JOIN "CartItemVendorServiceOption" as "civso" ON "ci"."id" = "civso"."cartItemId"
  INNER JOIN "VendorServiceOption" AS "vso" ON "civso"."vendorServiceOptionId" = "vso"."id"
  WHERE
    "ci"."cartId" = ${cartId}
    AND "i"."productstatus" = 'AVAILABLE'
    AND "i"."status" = 'ACTIVE'
    AND "i"."dailyTotalQty" >= "ci"."quantity"
    AND "vso"."status" = 'ACTIVE';
  `,
      this.prisma.$queryRaw<CartItemWithItem[]>`
  SELECT ci.*, i.*, civso.*
  FROM "CartItem" AS "ci"
  INNER JOIN "Item" AS "i" ON "i"."id" = "ci"."itemId"
  INNER JOIN "CartItemVendorServiceOption" AS "civso" ON "ci"."id" = "civso"."cartItemId"
  INNER JOIN "VendorServiceOption" AS "vso" ON "civso"."vendorServiceOptionId" = "vso"."id"
  WHERE
    "ci"."cartId" = ${cartId}
    AND "i"."productstatus" = 'AVAILABLE'
    AND "i"."status" = 'ACTIVE'
    AND "i"."dailyTotalQty" >= "ci"."quantity"
    AND "vso"."status" = 'ACTIVE';
  `,
    ]);

    if (cartItems.length === 0) {
      throw new BadRequestException(
        `Apologies, your cart is empty or the items are currently unavailable for ordering. Please review your cart before proceeding.`,
      );
    }

    return {
      totals: totals[0],
      cartItems,
    };
  }

  async addCartBanner({
    userId,
    body,
    res,
  }: {
    userId: string;
    body: AddCartBannerDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { bannerId, quantity, vendorServiceOptionIds } = body;

    const banner = await this.prisma.banner.findUnique({
      where: { id: bannerId },
      include: {
        bannerItems: {
          include: { item: true },
        },
      },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    if (banner.status !== 'ACTIVE') {
      throw new BadRequestException('Banner is currently not active');
    }

    const now = new Date();
    if (banner.startDateTime > now || banner.endDateTime < now) {
      throw new BadRequestException('Banner offer is not active at this time');
    }

    const maxAllowedQty = banner.qty ? Math.min(banner.qty, 10) : 3;
    if (quantity > maxAllowedQty) {
      throw new BadRequestException(
        `Quantity cannot exceed maximum allowed limit of ${maxAllowedQty} for this combo banner`,
      );
    }

    const vendorId = banner.vendorId;

    const vendorServiceOption =
      await this.vendorSerOptSer.getVendorServiceOptions({
        vendorId,
        vendorServicesIds: vendorServiceOptionIds,
      });
    if (vendorServiceOption.length !== vendorServiceOptionIds.length) {
      throw new BadRequestException(
        'Some of the ServiceOption is not found or not associated with the Vendor',
      );
    }

    const cart = await this.findOrCreateCartByUserId(userId, vendorId);

    const cartBanner = await this.prisma.$transaction(async (tx) => {
      const existingCartBanner = await tx.cartBanner.findUnique({
        where: {
          cartId_bannerId: {
            cartId: cart.id,
            bannerId,
          },
        },
      });

      let cartBannerId: string;

      if (existingCartBanner) {
        await tx.cartBanner.update({
          where: { id: existingCartBanner.id },
          data: {
            quantity,
          },
        });

        await tx.cartBannerVendorServiceOption.deleteMany({
          where: { cartBannerId: existingCartBanner.id },
        });

        await tx.cartBannerVendorServiceOption.createMany({
          data: vendorServiceOptionIds.map((id) => ({
            cartBannerId: existingCartBanner.id,
            vendorServiceOptionId: id,
          })),
        });

        cartBannerId = existingCartBanner.id;
      } else {
        const created = await tx.cartBanner.create({
          data: {
            cartId: cart.id,
            bannerId,
            quantity,
            cartBannerVendorServiceOption: {
              createMany: {
                data: vendorServiceOptionIds.map((id) => ({
                  vendorServiceOptionId: id,
                })),
              },
            },
          },
        });
        cartBannerId = created.id;
      }

      return await tx.cartBanner.findUnique({
        where: { id: cartBannerId },
        include: {
          banner: {
            include: {
              bannerItems: {
                include: {
                  item: true,
                },
              },
            },
          },
          cartBannerVendorServiceOption: {
            include: {
              vendorServiceOption: {
                include: {
                  serviceOption: true,
                },
              },
            },
          },
        },
      });
    });

    return this.response.successResponse({
      message: 'Combo Banner added to cart successfully',
      initialDate,
      res,
      data: cartBanner,
      statusCode: 200,
    });
  }

  async updateCartBannerQty({
    userId,
    cartBannerId,
    body,
    res,
  }: {
    userId: string;
    cartBannerId: string;
    body: UpdateCartBannerQtyDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const cartBanner = await this.findCartBannerByUser(userId, cartBannerId);
    if (!cartBanner) {
      throw new NotFoundException(
        'Combo Banner not found in cart or not associated with user',
      );
    }

    if (body.quantity <= 0) {
      return await this.removeCartBanner({
        userId,
        cartBannerId,
        res,
      });
    }

    const maxAllowedQty = cartBanner.banner.qty
      ? Math.min(cartBanner.banner.qty, 10)
      : 3;
    if (body.quantity > maxAllowedQty) {
      throw new BadRequestException(
        `Quantity cannot exceed maximum allowed limit of ${maxAllowedQty} for this combo banner`,
      );
    }

    const updated = await this.prisma.cartBanner.update({
      where: { id: cartBanner.id },
      data: { quantity: body.quantity },
      include: {
        banner: {
          include: {
            bannerItems: {
              include: { item: true },
            },
          },
        },
        cartBannerVendorServiceOption: {
          include: {
            vendorServiceOption: {
              include: { serviceOption: true },
            },
          },
        },
      },
    });

    return this.response.successResponse({
      initialDate,
      res,
      message: 'Combo Banner quantity updated successfully',
      data: updated,
      statusCode: 200,
    });
  }

  async removeCartBanner({
    userId,
    cartBannerId,
    res,
  }: {
    userId: string;
    cartBannerId: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const cartBanner = await this.findCartBannerByUser(userId, cartBannerId);
    if (!cartBanner) {
      throw new NotFoundException(
        'Combo Banner not found in cart or not associated with user',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const removed = await tx.cartBanner.delete({
        where: { id: cartBanner.id },
      });

      const [cartItemCount, cartBannerCount] = await Promise.all([
        tx.cartItem.count({ where: { cartId: removed.cartId } }),
        tx.cartBanner.count({ where: { cartId: removed.cartId } }),
      ]);

      if (cartItemCount === 0 && cartBannerCount === 0) {
        await tx.cart.delete({ where: { id: removed.cartId } });
      }

      return removed;
    });

    return this.response.successResponse({
      res,
      initialDate,
      message: 'Combo Banner removed from cart successfully',
      statusCode: 200,
      data: result,
    });
  }

  async findCartBannerByUser(userId: string, cartBannerId: string) {
    return await this.prisma.cartBanner.findFirst({
      where: {
        id: cartBannerId,
        cart: {
          userId,
        },
      },
      include: {
        banner: {
          include: {
            bannerItems: {
              include: { item: true },
            },
          },
        },
      },
    });
  }

  async getAvailableCartData({ cartId }: { cartId: string }) {
    const [cartItems, cartBanners] = await Promise.all([
      this.prisma.cartItem.findMany({
        where: { cartId },
        include: {
          item: true,
          cartItemVendorServiceOption: {
            include: {
              vendorServiceOption: {
                include: { serviceOption: true },
              },
            },
          },
        },
      }),
      this.prisma.cartBanner.findMany({
        where: { cartId },
        include: {
          banner: {
            include: {
              bannerItems: {
                include: { item: true },
              },
            },
          },
          cartBannerVendorServiceOption: {
            include: {
              vendorServiceOption: {
                include: { serviceOption: true },
              },
            },
          },
        },
      }),
    ]);

    if (cartItems.length === 0 && cartBanners.length === 0) {
      throw new BadRequestException(
        'Apologies, your cart is empty or the items are currently unavailable for ordering. Please review your cart before proceeding.',
      );
    }

    let regularTotal = 0;
    let regularDiscountTotal = 0;
    for (const ci of cartItems) {
      if (
        ci.item.productstatus !== 'AVAILABLE' ||
        ci.item.status !== 'ACTIVE'
      ) {
        throw new BadRequestException(
          `Item "${ci.item.name}" is currently unavailable. Please review your cart.`,
        );
      }
      const price = ci.item.price;
      const discount = ci.item.discountPrice ?? price;
      regularTotal += ci.quantity * price;
      regularDiscountTotal += ci.quantity * discount;
    }

    let bannerTotal = 0;
    let bannerDiscountTotal = 0;
    for (const cb of cartBanners) {
      if (cb.banner.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Combo Banner "${cb.banner.name}" is no longer active. Please review your cart.`,
        );
      }
      const prices = calculateBannerPrices(cb.banner);
      bannerTotal += cb.quantity * prices.originalPrice;
      bannerDiscountTotal += cb.quantity * prices.discountedPrice;
    }

    const totalAmount = Math.max(0, regularTotal + bannerTotal);
    const discountedAmount = Math.max(
      0,
      regularDiscountTotal + bannerDiscountTotal,
    );

    const requirementMap = new Map<
      string,
      {
        itemId: string;
        itemName: string;
        regularQty: number;
        comboQty: number;
        totalRequiredQty: number;
        item: any;
      }
    >();

    for (const ci of cartItems) {
      const existing = requirementMap.get(ci.itemId) || {
        itemId: ci.itemId,
        itemName: ci.item.name,
        regularQty: 0,
        comboQty: 0,
        totalRequiredQty: 0,
        item: ci.item,
      };
      existing.regularQty += ci.quantity;
      existing.totalRequiredQty += ci.quantity;
      requirementMap.set(ci.itemId, existing);
    }

    for (const cb of cartBanners) {
      if (cb.banner.bannerItems) {
        for (const bi of cb.banner.bannerItems) {
          if (!bi.item) continue;
          const existing = requirementMap.get(bi.itemId) || {
            itemId: bi.itemId,
            itemName: bi.item.name,
            regularQty: 0,
            comboQty: 0,
            totalRequiredQty: 0,
            item: bi.item,
          };
          const added = cb.quantity * bi.quantity;
          existing.comboQty += added;
          existing.totalRequiredQty += added;
          requirementMap.set(bi.itemId, existing);
        }
      }
    }

    for (const req of requirementMap.values()) {
      if (
        req.item.remainingQty < req.totalRequiredQty ||
        req.item.dailyTotalQty < req.totalRequiredQty
      ) {
        throw new BadRequestException(
          `Insufficient stock for "${req.itemName}". Required: ${req.totalRequiredQty}, Available: ${req.item.remainingQty}.`,
        );
      }
    }

    return {
      totals: {
        total: totalAmount,
        discountTotal: discountedAmount,
      },
      cartItems,
      cartBanners,
      aggregatedRequirements: Array.from(requirementMap.values()),
    };
  }
}
