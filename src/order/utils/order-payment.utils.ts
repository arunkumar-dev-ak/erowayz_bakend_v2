import { PaymentSerice } from 'src/payment/payment.service';
import { OrderPaymentDto } from '../dto/order-payment.dto';
import { OrderService } from '../order.service';
import { WalletService } from 'src/wallet/wallet.service';
import { BadRequestException } from '@nestjs/common';
import {
  OrderPaymentType,
  OrderStatus,
  PaymentPurpose,
  Prisma,
  WalletTransactionType,
} from '@prisma/client';
import { ErrorLogService } from 'src/error-log/error-log.service';
import { PaymentJuspayService } from 'src/payment/payment.juspay.service';
import { JuspayOrderResponse } from 'src/payment/dto/juspay-webhook.dto';

export const OrderPaymentUtils = async ({
  tx,
  body,
  orderService,
  userId,
  paymentService,
  walletService,
  vendorWalletLimit,
  errorLogService,
  paymentJuspayService,
  orderMaxInitiationCount,
}: {
  body: OrderPaymentDto;
  orderService: OrderService;
  paymentService: PaymentSerice;
  walletService: WalletService;
  userId: string;
  tx: Prisma.TransactionClient;
  vendorWalletLimit: number;
  errorLogService: ErrorLogService;
  paymentJuspayService: PaymentJuspayService;
  orderMaxInitiationCount: number;
}) => {
  const { orderId } = body;

  /** 1. Validate order */
  const existingOrder = await orderService.getOrderById(orderId, userId);
  if (!existingOrder) {
    throw new BadRequestException(
      'Order not found or not associated with User',
    );
  }
  if (existingOrder.orderPayment) {
    throw new BadRequestException('Payment already done for this order');
  }
  if (existingOrder.orderStatus === OrderStatus.CANCELLED) {
    throw new BadRequestException("You can't pay for the Cancelled order");
  } else if (existingOrder.orderStatus === OrderStatus.PENDING) {
    throw new BadRequestException(
      'Vendor not accepted the order.You can pay after the order is accepted',
    );
  }

  const preferredType = existingOrder.preferredPaymentMethod;
  const customerUserId = userId;
  const vendorUserId =
    existingOrder.orderItems[0].orderItemVendorServiceOption[0]
      .vendorServiceOption.vendor.userId;

  /** Return objects for service */
  let updateVendorWalletQuery: Prisma.WalletUpdateArgs | null = null;
  let updateCustomerWalletQuery: Prisma.WalletUpdateArgs | null = null;
  let walletTransactionCreateQuery: Prisma.WalletTransactionCreateArgs | null =
    null;
  let paymentCreateQuery: Prisma.PaymentCreateInput | null = null;

  /** 2. Handle payment type cases */
  if (preferredType === OrderPaymentType.CASH) {
    throw new BadRequestException(
      'You can pay the amount while receiving your order',
    );
  }

  if (preferredType === OrderPaymentType.JUSPAY) {
    if (
      (await orderService.checkOrderPaymentInitiationCount(
        existingOrder.userId,
        existingOrder.id,
      )) > orderMaxInitiationCount
    ) {
      throw new BadRequestException(
        'You have exceeded the limit for order payment initiation. Please try again after 5 minutes.',
      );
    }
    // Placeholder: Juspay logic
    const jusPayOrder: JuspayOrderResponse | undefined =
      await paymentJuspayService.createOrder({
        amount: existingOrder.finalPayableAmount,
        user: existingOrder.orderedUser,
        referenceId: existingOrder.id,
        paymentPurpose: PaymentPurpose.PRODUCT_PURCHASE,
      });

    if (!jusPayOrder) {
      return {
        paymentCreateQuery,
        sdk_payload: null,
        updateVendorWalletQuery,
        updateCustomerWalletQuery,
        walletTransactionCreateQuery,
      };
    }

    paymentCreateQuery = {
      juspayOrderId: jusPayOrder.id,
      orderId: jusPayOrder.order_id,
      amount: existingOrder.finalPayableAmount,
      purpose: PaymentPurpose.PRODUCT_PURCHASE,
      referenceId: existingOrder.id,
      status: 'PENDING',
      paymentLinkWeb: jusPayOrder.payment_links.web,
      paymentPageExpiry: new Date(jusPayOrder.payment_links.expiry),
      user: {
        connect: {
          id: existingOrder.userId,
        },
      },
    };
    return {
      paymentCreateQuery,
      sdk_payload: jusPayOrder.sdk_payload,
      updateVendorWalletQuery,
      updateCustomerWalletQuery,
      walletTransactionCreateQuery,
    };
  }

  /** 3. Wallet logic for COINS */
  const finalPayableAmount = Math.round(existingOrder.finalPayableAmount);

  const [vendorWallet, customerWallet] = await Promise.all([
    walletService.createOrFindWallet(vendorUserId, tx),
    walletService.createOrFindWallet(customerUserId, tx),
  ]);

  const vendorBalance = vendorWallet.balance;
  const vendorLockedBalance = vendorWallet.lockedBalance;
  const vendorPaymentReqForCoins =
    await paymentService.getPaymentForCoinsByVendor(vendorUserId);

  const finalLockedBalance =
    vendorBalance +
    vendorLockedBalance +
    (vendorPaymentReqForCoins?.amount || 0);

  /** 4. Insufficient customer balance case */
  if (customerWallet.balance < finalPayableAmount) {
    await errorLogService.logPaymentError({
      tx,
      referenceId: orderId,
      vendorUserId,
      customerUserId,
      errorType: 'INSUFFICIENT_CUSTOMER_FUNDS',
      message: `Customer has ${customerWallet.balance} but needs ${finalPayableAmount}.`,
      metaData: {
        customerBalance: customerWallet.balance,
        vendorLockedAmount: finalLockedBalance,
        finalPayableAmount,
      },
    });

    // Vendor wallet rollback
    updateVendorWalletQuery = {
      where: { userId: vendorUserId },
      data: { lockedBalance: { decrement: finalPayableAmount } },
    };

    // Returning only vendor update — triggers BadRequest in service
    return {
      updateVendorWalletQuery,
      updateCustomerWalletQuery: null,
      walletTransactionCreateQuery: null,
      orderPaymentQuery: null,
    };
  }

  /** 5. Vendor wallet limit exceeded (log but allow) */
  if (finalLockedBalance > vendorWalletLimit) {
    await errorLogService.logPaymentError({
      tx,
      referenceId: orderId,
      vendorUserId,
      customerUserId,
      errorType: 'VENDOR_LIMIT_EXCEEDED',
      message: `Vendor wallet limit exceeded. Limit=${vendorWalletLimit}, Current=${finalLockedBalance}.`,
      metaData: {
        vendorBalance,
        vendorLockedBalance,
        vendorPaymentReqForCoins: vendorPaymentReqForCoins?.amount || 0,
        finalLockedBalance,
      },
    });
  }

  /** 6. Vendor wallet update */
  updateVendorWalletQuery = {
    where: { userId: vendorUserId },
    data: {
      lockedBalance: { decrement: finalPayableAmount },
      balance: { increment: finalPayableAmount },
    },
  };

  /** 7. Customer wallet update */
  updateCustomerWalletQuery = {
    where: { userId: customerUserId },
    data: { balance: { decrement: finalPayableAmount }, locked: false },
  };

  /** 8. Wallet transaction creation */
  walletTransactionCreateQuery = {
    data: {
      senderWalletId: customerWallet.id,
      receiverWalletId: vendorWallet.id,
      transactionType: WalletTransactionType.CUSTOMER_TO_VENDOR_ORDER,
      amount: finalPayableAmount,
      reason: 'Transferring an amount to vendor for order',
    },
  };

  /** 9. Order payment creation */
  // orderPaymentQuery = {
  //   data: {
  // orderId,
  // type: OrderPaymentType.COINS,
  // paidedAmount: finalPayableAmount,
  //   },
  // };

  return {
    updateVendorWalletQuery,
    updateCustomerWalletQuery,
    walletTransactionCreateQuery,
    existingOrder,
    finalPayableAmount,
  };
};
