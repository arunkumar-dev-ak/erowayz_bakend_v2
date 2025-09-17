import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DeclineByType,
  Order,
  OrderPayment,
  OrderPaymentType,
  OrderStatus,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  Staff,
  User,
  Vendor,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { ItemService } from 'src/item/item.service';
import { BannerService } from 'src/banner/banner.service';
import { ResponseService } from 'src/response/response.service';
import { CartService } from 'src/cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  getBestPrice,
  getTotalAndDiscountForItem,
  groupedItem,
  handleItemVerification,
  handleVendorForOrder,
} from './utils/order.utils';
import { VendorServiceOptionService } from 'src/vendor-service-option/vendor-service-option.service';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { buildOrderWhereFilter } from './utils/order-where-filter';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { CustomerGetOrderQueryDto } from './dto/customer-get-order-querydto';
import { buildCustomerOrderWhereFilter } from './utils/customer-order-where-filter';
import { VendorService } from 'src/vendor/vendor.service';
import { OrderGateway } from 'src/order-gateway/order-gateway.gateway';
import { createOrderId } from './utils/create-orderId';
import { extractMilliSecond } from 'src/common/functions/extract_millisecond';
import { CartItemWithItem } from 'src/cart/utils/cartItem_raw_types.utils';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { GetAdminOrderQueryDto } from './dto/get-order-admin-query.dto';
import { buildAdminOrderWhereFilter } from './utils/get-admin-order.utils';
import {
  DeliveredOrderUtils,
  NotifyOnOrderStatusChange,
  OrderStatusChangeUtils,
} from './utils/order-status-change.utils';
import { lockVendorAndCustomerWallet } from './utils/create-order.utils';
import { WalletService } from 'src/wallet/wallet.service';
import { PaymentSerice } from 'src/payment/payment.service';
import { ConfigService } from '@nestjs/config';
import {
  isSerializationError,
  randomJitter,
  sleep,
} from 'src/common/functions/isolation-retry-functions';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { OrderPaymentUtils } from './utils/order-payment.utils';
import { ErrorLogService } from 'src/error-log/error-log.service';
import { PaymentJuspayService } from 'src/payment/payment.juspay.service';

@Injectable()
export class OrderService {
  private readonly MAX_RETRIES;
  private readonly ORDER_MAX_INITIATION_COUNT;

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly itemService: ItemService,
    private readonly bannerService: BannerService,
    private readonly vendorSerOptSer: VendorServiceOptionService,
    private readonly response: ResponseService,
    private readonly cartService: CartService,
    private readonly vendorService: VendorService,
    private readonly orderGateway: OrderGateway,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly walletService: WalletService,
    private readonly paymentService: PaymentSerice,
    private readonly configService: ConfigService,
    private readonly errorLogService: ErrorLogService,
    private readonly paymentJuspayService: PaymentJuspayService,
  ) {
    this.MAX_RETRIES = parseInt(
      configService.get<string>('ISOLATION_LEVEL_MAX_RETRIES') || '3',
    );
    this.ORDER_MAX_INITIATION_COUNT = parseInt(
      configService.get<string>('ORDER_MAX_INITIATION_COUNT') || '1',
    );
  }

  statusFlowMap: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['DELIVERED', 'COMPLETED'],
    COMPLETED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  /*----- get Orders -----*/
  async getOrdersForVendor({
    vendorId,
    res,
    query,
    offset,
    limit,
  }: {
    vendorId: string;
    res: Response;
    query: GetOrderQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const { startDate, endDate, serviceOptionsIds, paymentMode, orderStatus } =
      query;

    const where: Prisma.OrderWhereInput = buildOrderWhereFilter({
      vendorId,
      startDate,
      endDate,
      serviceOptionsIds,
      paymentMode,
      orderStatus,
    });

    const totalCount = await this.prisma.order.count({ where });

    const [vendor, orders] = await Promise.all([
      await this.vendorService.findVendorById({ id: vendorId }),
      await this.prisma.order.findMany({
        where,
        skip: Number(offset),
        take: Number(limit),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          orderItems: {
            include: {
              item: {
                include: {
                  itemImage: true,
                },
              },
              orderItemVendorServiceOption: {
                include: {
                  vendorServiceOption: {
                    include: {
                      serviceOption: true,
                    },
                  },
                },
              },
            },
          },
          orderedUser: {
            select: {
              id: true,
              name: true,
              nameTamil: true,
              imageRef: true,
              status: true,
              favouriteCustomerForVendor: {
                where: {
                  vendorId,
                },
              },
            },
          },
          declinedUser: {
            select: {
              id: true,
              name: true,
              nameTamil: true,
              imageRef: true,
              status: true,
            },
          },
        },
      }),
    ]);

    const queries = buildQueryParams({
      startDate,
      endDate,
      serviceOptionsIds,
      paymentMode,
      orderStatus,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'order/vendor',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: { vendor, orders },
      meta,
      message: 'Order retrieved successfully',
      statusCode: 200,
    });
  }

  async getOrdersForUser({
    userId,
    res,
    query,
    offset,
    limit,
  }: {
    userId: string;
    res: Response;
    query: CustomerGetOrderQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const { startDate, endDate } = query;

    const where: Prisma.OrderWhereInput = buildCustomerOrderWhereFilter({
      userId,
      startDate,
      endDate,
    });

    const totalCount = await this.prisma.order.count({ where });

    const orders = await this.prisma.order.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                itemImage: true,
                vendor: {
                  include: {
                    shopInfo: true,
                  },
                },
              },
            },
            orderItemVendorServiceOption: {
              include: {
                vendorServiceOption: {
                  include: {
                    serviceOption: true,
                  },
                },
              },
            },
            review: true,
          },
        },
        declinedUser: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            imageRef: true,
            status: true,
          },
        },
      },
    });

    const queries = buildQueryParams({
      userId,
      startDate,
      endDate,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'order/customer',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: orders,
      meta,
      message: 'Order retrieved successfully',
      statusCode: 200,
    });
  }

  async getOrdersForAdmin({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetAdminOrderQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where: Prisma.OrderWhereInput = buildAdminOrderWhereFilter({
      query,
    });

    const totalCount = await this.prisma.order.count({ where });

    const orders = await this.prisma.order.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                itemImage: true,
                vendor: {
                  include: {
                    shopInfo: true,
                    User: {
                      select: {
                        name: true,
                        nameTamil: true,
                        id: true,
                        imageRef: true,
                        mobile: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            },
            orderItemVendorServiceOption: {
              include: {
                vendorServiceOption: {
                  include: {
                    serviceOption: true,
                  },
                },
              },
            },
          },
        },
        declinedUser: {
          select: {
            id: true,
            name: true,
            imageRef: true,
            status: true,
          },
        },
        orderedUser: {
          select: {
            name: true,
            nameTamil: true,
            status: true,
            email: true,
            imageRef: true,
            mobile: true,
          },
        },
      },
    });

    const { vendorName, startDate, endDate, userName, shopName, orderId } =
      query;
    const queries = buildQueryParams({
      vendorName,
      startDate,
      endDate,
      userName,
      shopName,
      orderId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'order/admin',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: orders,
      meta,
      message: 'Order retrieved successfully',
      statusCode: 200,
    });
  }

  /*----- get orderItems -----*/
  async getOrderItems({
    userId,
    vendorId,
    res,
    orderId,
  }: {
    userId?: string;
    vendorId?: string;
    res: Response;
    orderId: string;
  }) {
    const initialDate = new Date();

    const [order, orderItems] = await Promise.all([
      await this.getOrderById(orderId, userId, vendorId),
      await this.getOrderItemsByOrder(orderId),
    ]);

    if (!order) {
      throw new BadRequestException(
        'Order Not found or not associated with the user',
      );
    }

    return await this.response.successResponse({
      initialDate,
      res,
      message: 'Order Items received successfully',
      data: { order, orderItems },
      statusCode: 200,
    });
  }

  /*----- Create Order-Main Entry -----*/
  async createOrder({
    userId,
    res,
    body,
  }: {
    userId: string;
    res: Response;
    body: CreateOrderDto;
  }) {
    const {
      cartId,
      itemId,
      preferredPaymentMethod,
      totalQty,
      bannerId,
      vendorServiceOptionIds,
    } = body;

    if (itemId && totalQty && vendorServiceOptionIds) {
      return this.handleItemOrder({
        userId,
        res,
        itemId,
        totalQty,
        preferredPaymentMethod,
        bannerId,
        vendorServiceOptionIds,
      });
    } else if (cartId) {
      return this.handleCartOrder({
        userId,
        res,
        cartId,
        preferredPaymentMethod,
        bannerId,
      });
    }
  }

  //item-based orders
  async handleItemOrder({
    userId,
    res,
    itemId,
    totalQty,
    preferredPaymentMethod,
    bannerId,
    vendorServiceOptionIds,
  }: {
    userId: string;
    res: Response;
    itemId: string;
    totalQty: number;
    preferredPaymentMethod: PaymentMethod;
    bannerId?: string;
    vendorServiceOptionIds?: string[];
  }) {
    const initialDate = new Date();
    const item = await this.itemService.getItemById(itemId);
    if (!item) throw new NotFoundException('Item not found');

    //Check Shop open and vendor Active
    handleVendorForOrder({ vendor: item.vendor });
    //check item active and minum qty
    handleItemVerification({ item, totalQty });

    const { totalAmount, discountedAmount } = getTotalAndDiscountForItem(
      item,
      totalQty,
    );

    if (!vendorServiceOptionIds || vendorServiceOptionIds.length === 0) {
      throw new BadRequestException(
        `Atleast 1 of the ServiceOption is required`,
      );
    }

    const [banner, vendorServiceOption] = await Promise.all([
      bannerId
        ? this.bannerService.checkIsBannerValid({
            bannerId,
            totalAmount,
            vendorId: item.vendorId,
          })
        : null,
      this.vendorSerOptSer.getVendorServiceOptions({
        vendorId: item.vendorId,
        vendorServicesIds: vendorServiceOptionIds,
      }),
    ]);

    if (bannerId && !banner)
      throw new BadRequestException('Invalid Offer Banner, Try Again later');

    if (vendorServiceOption.length !== vendorServiceOptionIds.length)
      throw new BadRequestException(
        'ServiceOption is not associated with the Vendor',
      );

    const bestPrice = getBestPrice({ totalAmount, discountedAmount, banner });
    const expiryMilliseconds = extractMilliSecond(
      process.env.ORDER_EXPIRY_TIME || '2m',
    );
    const expiryAt = new Date(Date.now() + expiryMilliseconds.milliseconds);

    const orderId = await createOrderId(this.prisma);

    const result = await this.prisma.$transaction(async (tx) => {
      //update remaining qty
      await tx.item.update({
        where: {
          id: itemId,
        },
        data: {
          remainingQty: item.remainingQty - totalQty,
        },
      });
      //update order
      const order = await tx.order.create({
        data: {
          userId,
          orderId,
          preferredPaymentMethod,
          orderItems: {
            create: {
              itemId,
              quantity: totalQty,
              quantityUnit: item.quantityUnit,
              price: item.price,
              discountPrice: item.discountPrice,
              orderItemVendorServiceOption: {
                createMany: {
                  data: vendorServiceOptionIds.map((id) => ({
                    vendorServiceOptionId: id,
                  })),
                },
              },
            },
          },
          totalPrice: totalAmount,
          finalPayableAmount: bestPrice,
          expiryAt,
          bannerId: banner?.id ?? null,
          bannerTitle: banner?.name ?? null,
          bannerOfferValue: banner?.offerValue ?? null,
          bannerOfferType: banner?.offerType ?? null,
        },
        select: {
          id: true,
          userId: true,
          orderId: true,
          orderStatus: true,
          preferredPaymentMethod: true,
          orderPayment: true,
          bannerId: true,
          expiryAt: true,
          orderedUser: {
            select: {
              name: true,
              nameTamil: true,
            },
          },
        },
      });

      return order;
    });

    // Send real time data to vendor
    await this.orderGateway.notifyUser(
      vendorServiceOption[0].vendor.userId,
      'orderStatus',
      result,
    );

    //send notification
    await this.firebaseNotificationService.sendNotificationToAllSession({
      receiverId: item.vendor.userId,
      isReceiverVendor: true,
      title: '🛒 New Order Received!',
      content: `You’ve received a new order from ${result.orderedUser.name}. Tap to view order #${result.orderId}.`,
      vendorType: 'PRODUCT',
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: result,
      message: 'Order Placed Successfully',
      statusCode: 200,
    });
  }

  //cart-based orders
  async handleCartOrder({
    userId,
    res,
    cartId,
    preferredPaymentMethod,
    bannerId,
  }: {
    userId: string;
    res: Response;
    cartId: string;
    preferredPaymentMethod: PaymentMethod;
    bannerId?: string;
  }) {
    const initialDate = new Date();

    const cart = await this.cartService.findCartByUserId(userId, cartId);
    if (!cart)
      throw new BadRequestException(
        'Cart not found or not associated with the User',
      );

    //check shop Open and vendor Active
    handleVendorForOrder({ vendor: cart.vendor });

    const {
      totals,
      cartItems,
    }: {
      totals: { total: number; discountTotal: number };
      cartItems: CartItemWithItem[];
    } = await this.cartService.getAvailableCartItemsWithPrice({ cartId });

    const banner = bannerId
      ? await this.bannerService.checkIsBannerValid({
          bannerId,
          totalAmount: totals.total,
          vendorId: cart.vendorId,
        })
      : null;

    if (bannerId && !banner)
      throw new BadRequestException('Invalid Offer Banner, Try Again later');

    const bestPrice = getBestPrice({
      totalAmount: totals.total,
      discountedAmount: totals.discountTotal,
      banner,
    });

    const expiryMilliseconds = extractMilliSecond(
      process.env.ORDER_EXPIRY_TIME || '2m',
    );
    const expiryAt = new Date(Date.now() + expiryMilliseconds.milliseconds);
    const orderItemsData = groupedItem(cartItems);
    const orderId = await createOrderId(this.prisma);
    const vendorUserId = cart.vendor.User.id;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.prisma.$transaction(
          async (tx) => {
            //lock wallet
            if (preferredPaymentMethod === 'COINS') {
              const { vendorWalletUpdateQuery, customerWalletUpdateQuery } =
                await lockVendorAndCustomerWallet({
                  tx,
                  customerUserId: userId,
                  vendorUserId,
                  walletService: this.walletService,
                  paymentService: this.paymentService,
                  payableAmount: bestPrice,
                });

              //vendor wallet update
              await this.prisma.wallet.update({
                where: {
                  userId: vendorUserId,
                },
                data: vendorWalletUpdateQuery,
              });

              //customer wallet update
              await this.prisma.wallet.update({
                where: {
                  userId: userId,
                },
                data: customerWalletUpdateQuery,
              });
            }

            //create order
            const order = await tx.order.create({
              data: {
                orderId,
                userId,
                preferredPaymentMethod,
                orderItems: {
                  create: orderItemsData,
                },
                totalPrice: totals.total,
                finalPayableAmount: bestPrice,
                expiryAt,
                bannerId: banner?.id ?? null,
                bannerTitle: banner?.name ?? null,
                bannerOfferValue: banner?.offerValue ?? null,
                bannerOfferType: banner?.offerType ?? null,
              },
              select: {
                id: true,
                userId: true,
                orderStatus: true,
                preferredPaymentMethod: true,
                orderPayment: true,
                orderId: true,
                bannerId: true,
                expiryAt: true,
                orderedUser: {
                  select: {
                    name: true,
                    nameTamil: true,
                  },
                },
              },
            });

            //update order
            const updatingRemaingQty = cartItems.map((cartItem) =>
              tx.item.update({
                where: { id: cartItem.itemId },
                data: {
                  remainingQty: {
                    decrement: cartItem.quantity,
                  },
                },
              }),
            );
            await Promise.all(updatingRemaingQty);
            await tx.cart.delete({
              where: {
                id: cartId,
              },
            });

            return order;
          },
          {
            isolationLevel: 'Serializable',
          },
        );

        // Send real time data to vendor
        await this.orderGateway.notifyUser(
          cart.vendor.userId,
          'orderStatus',
          result,
        );

        //send notification
        await this.firebaseNotificationService.sendNotificationToAllSession({
          receiverId: cart.vendor.userId,
          isReceiverVendor: true,
          title: '🛒 New Order Received!',
          content: `You’ve received a new order from ${result.orderedUser.name}. Tap to view order #${result.orderId}.`,
          vendorType: 'PRODUCT',
        });

        return this.response.successResponse({
          initialDate,
          res,
          data: result,
          message: 'Order Placed Successfully',
          statusCode: 200,
        });
      } catch (err: any) {
        if (isSerializationError(err)) {
          const delay = randomJitter(100 * 2 ** attempt);
          console.warn(
            `Retrying transaction due to serialization error (attempt ${
              attempt + 1
            }), waiting ${delay}ms`,
          );
          await sleep(delay);
          continue;
        }

        throw err;
      }
    }

    throw new Error(
      'Order failed after maximum retry attempts,Please Try after some time',
    );
  }

  async changeStatus({
    res,
    currentUser,
    body,
    orderId,
  }: {
    orderId: string;
    res: Response;
    currentUser: User & { vendor?: Vendor; staff?: Staff };
    body: ChangeOrderStatusDto;
  }) {
    //validation
    const {
      newStatus,
      userId,
      vendorUserId,
      customerUserId,
      existingOrder,
      initialDate,
    } = await OrderStatusChangeUtils({
      orderId,
      orderService: this,
      body,
      currentUser,
    });

    //update order
    let updatedOrder: Order | null = null;
    if (newStatus === 'IN_PROGRESS') {
      updatedOrder = await this.handleAcceptOrder(orderId);
    } else if (newStatus === 'CANCELLED') {
      updatedOrder = await this.handleCancelledOrder(orderId, userId);
    } else if (newStatus === 'DELIVERED') {
      updatedOrder = await this.handleDeliveringOrder({
        orderId,
        body,
        existingOrder,
        orderPayment: existingOrder.orderPayment,
        customerUserId,
        vendorUserId,
      });
    } else {
      updatedOrder = await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          orderStatus: body.orderStatus,
          declinedBy: body.orderStatus === 'CANCELLED' ? userId : null,
          declineType:
            body.orderStatus === 'CANCELLED'
              ? (currentUser.role as DeclineByType)
              : null,
        },
      });
    }

    await NotifyOnOrderStatusChange({
      reqSendedUserId: userId,
      vendorUserId,
      customerId: customerUserId,
      orderGateway: this.orderGateway,
      body,
      existingOrder,
      updatedOrder,
      firebaseNotificationService: this.firebaseNotificationService,
    });

    return this.response.successResponse({
      initialDate,
      res,
      message: 'OrderStatus changed Successfully',
      data: updatedOrder,
      statusCode: 200,
    });
  }

  async paymentForOrder({
    body,
    vendorUserId,
    res,
  }: {
    body: OrderPaymentDto;
    vendorUserId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const orderPayment = await this.prisma.$transaction(
          async (tx) => {
            const paymentOps = await OrderPaymentUtils({
              body,
              orderService: this,
              paymentService: this.paymentService,
              walletService: this.walletService,
              vendorUserId,
              tx,
              vendorWalletLimit: 2000,
              errorLogService: this.errorLogService,
              paymentJuspayService: this.paymentJuspayService,
              orderMaxInitiationCount: this.ORDER_MAX_INITIATION_COUNT,
            });

            const {
              updateVendorWalletQuery,
              updateCustomerWalletQuery,
              walletTransactionCreateQuery,
              finalPayableAmount,
              existingOrder,
              sdk_payload,
              paymentCreateQuery,
            } = paymentOps;

            const isVendorUpdateOnly =
              !updateCustomerWalletQuery && !walletTransactionCreateQuery;

            //Payment initiation
            if (paymentCreateQuery && sdk_payload) {
              const payment = await tx.payment.create({
                data: paymentCreateQuery,
              });
              return { payment, sdk_payload };
            }

            // Case 1: Only vendor wallet update (customer lacks funds)
            if (isVendorUpdateOnly && updateVendorWalletQuery) {
              await tx.wallet.update(updateVendorWalletQuery);
              throw new BadRequestException(
                'Out of coins. You can pay the amount while receiving your order',
              );
            }

            // Case 2: Normal payment flow
            if (updateCustomerWalletQuery) {
              await tx.wallet.update(updateCustomerWalletQuery);
            }
            if (updateVendorWalletQuery) {
              await tx.wallet.update(updateVendorWalletQuery);
            }
            if (walletTransactionCreateQuery) {
              const walletTransaction = await tx.walletTransaction.create(
                walletTransactionCreateQuery,
              );

              await tx.orderPayment.create({
                data: {
                  walletTransactionId: walletTransaction.id,
                  orderId: existingOrder.orderId,
                  type: OrderPaymentType.COINS,
                  paidedAmount: finalPayableAmount,
                },
              });
            }
          },
          { isolationLevel: 'Serializable' },
        );

        return this.response.successResponse({
          initialDate,
          data: orderPayment,
          res,
          message: orderPayment?.payment
            ? 'Payment initiated successfully'
            : 'Payment done successfully',
          statusCode: 201,
        });
      } catch (err: any) {
        // Retry logic for serialization errors
        if (isSerializationError(err)) {
          const delay = randomJitter(100 * 2 ** attempt);
          console.warn(
            `Retrying transaction due to serialization error (attempt ${
              attempt + 1
            }), waiting ${delay}ms`,
          );
          await sleep(delay);
          continue;
        }
        throw err;
      }
    }

    throw new Error('Payment failed after maximum retry attempts');
  }

  /*----- helper func -----*/
  async getOrderById(id: string, userId?: string, vendorId?: string) {
    const where: Prisma.OrderWhereInput = {
      id,
    };
    if (userId) {
      where.userId = userId;
    } else if (vendorId) {
      where.orderItems = {
        some: {
          orderItemVendorServiceOption: {
            some: {
              vendorServiceOption: {
                vendorId: vendorId,
              },
            },
          },
        },
      };
    }

    return await this.prisma.order.findFirst({
      where,
      include: {
        orderedUser: true, // customer user
        orderItems: {
          take: 1,
          include: {
            orderItemVendorServiceOption: {
              include: {
                vendorServiceOption: {
                  include: {
                    vendor: {
                      include: {
                        User: true, // vendor user
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderPayment: true,
      },
    });
  }

  async getOrderItemsById(id: string) {
    return await this.prisma.orderItem.findUnique({
      where: { id },
      include: { order: true, item: true },
    });
  }

  async getOrderItemsByOrder(orderId: string) {
    return await this.prisma.orderItem.findMany({
      where: {
        orderId,
      },
      include: {
        item: {
          include: {
            itemImage: true,
          },
        },
        orderItemVendorServiceOption: {
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
  }

  async checkOrderIsAssociateWithUser(
    order: Order,
    userId?: string,
    vendorId?: string,
  ) {
    if (vendorId) {
      const orderItem = await this.prisma.orderItem.findFirst({
        where: {
          orderId: order.id,
        },
        include: {
          item: true,
        },
      });
      if (!orderItem || orderItem.item.vendorId !== vendorId) {
        throw new BadRequestException(
          'You dont have access to change the status of order',
        );
      }
    } else if (userId && order.userId !== userId) {
      throw new BadRequestException(
        'You dont have access to change the status of order',
      );
    }
  }

  async cancelOrderBySystem(orderId: string) {
    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: 'CANCELLED',
        declineType: 'SYSTEM',
      },
    });
  }

  /*----- changeStatus helper -----*/
  async handleAcceptOrder(orderId: string) {
    const conflictOrderItems = await this.prisma.orderItem.findFirst({
      where: {
        id: orderId,
        item: {
          remainingQty: {
            lte: 0,
          },
        },
      },
      include: {
        item: true,
      },
    });

    if (conflictOrderItems) {
      throw new BadRequestException(
        `${conflictOrderItems.item.name} has no remaining quantity.So you can't accept the order`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: 'IN_PROGRESS',
      },
    });
    //need to send the notification to user
    return updatedOrder;
  }

  async handleCancelledOrder(orderId: string, userId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        orderId: orderId,
      },
      include: {
        item: true,
      },
    });

    return await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          orderStatus: 'CANCELLED',
          declinedUser: {
            connect: {
              id: userId,
            },
          },
        },
      });

      const updatingQty = orderItems.map((orderItem) => {
        const currentRemaining = orderItem.item.remainingQty;
        const maxQty = orderItem.item.dailyTotalQty;
        const incremented = currentRemaining + orderItem.quantity;
        const cappedQty = Math.min(incremented, maxQty);

        return tx.item.update({
          where: { id: orderItem.itemId },
          data: {
            remainingQty: cappedQty,
          },
        });
      });

      await Promise.all(updatingQty);

      return updatedOrder;
    });
  }

  async handleDeliveringOrder({
    orderId,
    body,
    orderPayment,
    existingOrder,
    vendorUserId,
    customerUserId,
  }: {
    orderId: string;
    body: ChangeOrderStatusDto;
    orderPayment?: OrderPayment | null;
    existingOrder: Order;
    vendorUserId: string;
    customerUserId: string;
  }) {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const {
            orderPaymentCreateQuery,
            updateVendorWalletQuery,
            updateCustomerWalletQuery,
          } = await DeliveredOrderUtils({
            tx,
            vendorUserId,
            customerUserId,
            orderPayment,
            body,
            existingOrder,
            walletService: this.walletService,
          });

          if (updateCustomerWalletQuery)
            await tx.wallet.update(updateCustomerWalletQuery);
          if (updateVendorWalletQuery)
            await tx.wallet.update(updateVendorWalletQuery);

          const updatedOrder = await tx.order.update({
            where: {
              id: orderId,
            },
            data: {
              orderStatus: 'DELIVERED',
              orderPayment: orderPaymentCreateQuery
                ? { create: orderPaymentCreateQuery }
                : undefined,
            },
          });

          return updatedOrder;
        });
      } catch (err: any) {
        if (isSerializationError(err)) {
          const delay = randomJitter(100 * 2 ** attempt);
          console.warn(
            `Serialization conflict, retrying attempt ${attempt + 1} after ${delay}ms`,
          );
          await sleep(delay);
          continue;
        }

        console.error('Payment changing to Cash failed:', err);
        throw err;
      }
    }
    throw new Error('Payment failed after maximum retry attempt');
  }

  async checkOrderPaymentInitiationCount(userId: string, orderId: string) {
    const currentDate = new Date();

    return await this.prisma.payment.count({
      where: {
        userId,
        purpose: PaymentPurpose.PRODUCT_PURCHASE,
        status: PaymentStatus.PENDING,
        paymentPageExpiry: {
          gt: currentDate,
        },
        referenceId: orderId,
      },
    });
  }
}
