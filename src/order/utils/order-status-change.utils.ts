import { BadRequestException } from '@nestjs/common';
import { OrderService } from '../order.service';
import { ChangeOrderStatusDto } from '../dto/change-order-status.dto';
import { checkValidStatus, extractUserAndVendorId } from './order.utils';
import {
  Order,
  OrderPayment,
  OrderPaymentStatus,
  OrderPaymentType,
  Staff,
  User,
  Vendor,
  Prisma,
  PaymentMethod,
} from '@prisma/client';

import { getNotificationContentForOrderStatus } from './order-notification-utils';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';
import { OrderGateway } from 'src/order-gateway/order-gateway.gateway';
import { WalletService } from 'src/wallet/wallet.service';

export const OrderStatusChangeUtils = async ({
  orderId,
  orderService,
  body,
  currentUser,
}: {
  orderService: OrderService;
  body: ChangeOrderStatusDto;
  orderId: string;
  currentUser: User & { vendor?: Vendor; staff?: Staff };
}) => {
  const initialDate = new Date();

  const { userId, vendorId } = extractUserAndVendorId(currentUser);

  const existingOrder = await orderService.getOrderById(orderId);
  if (!existingOrder) {
    throw new BadRequestException('Order not found');
  }

  //check user or vendor associate with order
  await orderService.checkOrderIsAssociateWithUser(
    existingOrder,
    userId,
    vendorId,
  );

  const newStatus = body.orderStatus;
  const currentStatus = existingOrder.orderStatus;

  //check expiration
  if (newStatus === 'IN_PROGRESS' && initialDate > existingOrder.expiryAt) {
    await orderService.cancelOrderBySystem(orderId);
    throw new BadRequestException(
      'Apologies, unfortunately the order has expired.',
    );
  }

  // validate status change
  checkValidStatus({
    userRole: currentUser.role,
    currentStatus,
    newStatus,
    statusFlowMap: orderService.statusFlowMap,
  });

  const customerUserId = existingOrder.userId;
  const vendorUserId =
    existingOrder.orderItems[0].orderItemVendorServiceOption[0]
      .vendorServiceOption.vendor.userId;

  return {
    newStatus,
    userId,
    vendorId,
    existingOrder,
    initialDate,
    vendorUserId,
    customerUserId,
  };
};

export const NotifyOnOrderStatusChange = async ({
  reqSendedUserId,
  vendorUserId,
  customerId,
  orderGateway,
  body,
  existingOrder,
  firebaseNotificationService,
  updatedOrder,
}: {
  reqSendedUserId: string;
  vendorUserId: string | undefined;
  customerId: string;
  orderGateway: OrderGateway;
  body: ChangeOrderStatusDto;
  existingOrder: Order;
  firebaseNotificationService: FirebaseNotificationService;
  updatedOrder: Order;
}) => {
  let receiverId: string;
  let reqSendedUserRole: 'vendor' | 'customer';
  let isReceiverVendor = false;

  if (reqSendedUserId === vendorUserId) {
    receiverId = customerId; // send to customer
    reqSendedUserRole = 'vendor';
  } else {
    receiverId = vendorUserId!; // send to vendor
    reqSendedUserRole = 'customer';
    isReceiverVendor = true;
  }

  await orderGateway.notifyUser(receiverId, 'orderStatus', updatedOrder);

  // 📨 Prepare Firebase notification content
  const notificationContent = getNotificationContentForOrderStatus({
    role: reqSendedUserRole,
    status: body.orderStatus,
    orderId: existingOrder.orderId,
  });

  // 🚀 Send notification
  await firebaseNotificationService.sendNotificationToAllSession({
    receiverId,
    isReceiverVendor,
    title: notificationContent.title,
    content: notificationContent.body,
    vendorType: 'PRODUCT',
  });
};

export const DeliveredOrderUtils = async ({
  orderPayment,
  body,
  existingOrder,
  tx,
  vendorUserId,
  customerUserId,
  walletService,
}: {
  orderPayment?: OrderPayment | null;
  body: ChangeOrderStatusDto;
  existingOrder: Order;
  tx: Prisma.TransactionClient;
  vendorUserId: string;
  customerUserId: string;
  walletService: WalletService;
}) => {
  const { isPaidByCash } = body;

  let orderPaymentCreateQuery: Prisma.OrderPaymentCreateInput | null = null;
  let updateVendorWalletQuery: Prisma.WalletUpdateArgs | null = null;
  let updateCustomerWalletQuery: Prisma.WalletUpdateArgs | null = null;

  if (!orderPayment || orderPayment === null) {
    if (!isPaidByCash || TrueOrFalseMap[isPaidByCash] !== true) {
      throw new BadRequestException(
        'Payment required via UPI, coins, or confirm cash received from customer.',
      );
    }

    orderPaymentCreateQuery = {
      type: OrderPaymentType.CASH,
      paidedAmount: Math.round(existingOrder.finalPayableAmount),
      status: OrderPaymentStatus.COMPLETED,
      order: {
        connect: {
          id: existingOrder.id,
        },
      },
    };
  }

  if (existingOrder.preferredPaymentMethod === PaymentMethod.COINS) {
    const finalPayableAmount = existingOrder.finalPayableAmount;
    const [vendorWallet, customerWallet] = await Promise.all([
      walletService.createOrFindWallet(vendorUserId, tx),
      walletService.createOrFindWallet(customerUserId, tx),
    ]);
    // const vendorUserId
    updateVendorWalletQuery = {
      where: {
        id: vendorWallet.id,
      },
      data: {
        lockedBalance: {
          decrement: finalPayableAmount,
        },
      },
    };

    updateCustomerWalletQuery = {
      where: {
        id: customerWallet.id,
      },
      data: {
        locked: false,
      },
    };
  }
  return {
    orderPaymentCreateQuery,
    updateVendorWalletQuery,
    updateCustomerWalletQuery,
  };
};
