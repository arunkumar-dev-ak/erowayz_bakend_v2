import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { AddCartDto } from './dto/add-cart.dto';
import { ItemService } from 'src/item/item.service';
import { Response } from 'express';
import { UpdateCartDto } from './dto/update-cart.dto';
import { BannerService } from 'src/banner/banner.service';
import { Cart } from '@prisma/client';
import { MetadataService } from 'src/metadata/metadata.service';
import { VendorServiceOptionService } from 'src/vendor-service-option/vendor-service-option.service';
import { UpdateCartServiceDto } from './dto/update-cart-service.dto';
import { BestOfferItemDto } from './dto/bestoffer-item.dto';
import { calculateBestPriceForItem } from './utils/cart.utils';
import { CartItemWithItem } from './utils/cartItem_raw_types.utils';
import { PlatformFeeService } from 'src/platform-fee/platform-fee.service';

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

    const totals = await this.prisma.$queryRaw<
      Array<{ total: number; discountTotal: number }>
    >`SELECT
    SUM(ci.quantity * i."price") AS "total",
    SUM(ci.quantity * COALESCE(i."discountPrice", i."price")) AS "discountTotal"
  FROM "CartItem" ci
  JOIN "Item" i ON ci."itemId" = i."id"
  WHERE ci."cartId" = ${cart.id}
    AND i."productstatus" = 'AVAILABLE'
    AND i."status" = 'ACTIVE'
    AND i."dailyTotalQty" >= ci."quantity"
`;

    const totalAmount = totals[0]?.total ?? 0;
    const discountedAmount = totals[0]?.discountTotal ?? 0;

    const platformFee = await this.platformFeeService.getFeesForOrdering({
      amount: discountedAmount,
    });

    const cartItems = await this.prisma.cartItem.findMany({
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
    });

    const { bestBanner, finalTotal } = await this.bannerService.findBestBanner(
      totalAmount,
      cart.vendorId,
    );

    const bestPrice = Math.min(finalTotal, discountedAmount);

    return this.response.successResponse({
      initialDate,
      res,
      statusCode: 200,
      message: 'CartItems fetched Successfully',
      data: {
        cart: { id: cart.id },
        cartItems,
        totalAmount,
        bestPrice,
        platformFee: platformFee ? platformFee.fee : 0,
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
    //Create item or update qty
    const cartItem = await this.prisma.cartItem.upsert({
      where: {
        cartId_itemId: {
          cartId: cart.id,
          itemId,
        },
      },
      create: {
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
      update: {
        quantity: totalQty,
      },
      include: {
        item: true,
      },
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
      //delete the cart if item count is 0
      const cartItemCount = await tx.cartItem.count({
        where: {
          cartId: removedCartItem.cartId,
        },
      });
      if (cartItemCount === 0) {
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
}
