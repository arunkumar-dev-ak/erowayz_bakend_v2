import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Job } from 'bull';
import {
  PaymentSerice,
  PaymentWithUserAndVendor,
} from 'src/payment/payment.service';
import {
  Payment,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  RefundStatus,
} from '@prisma/client';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
import { WalletService } from 'src/wallet/wallet.service';
import { OrderPaymentService } from 'src/order-payment/order-payment.service';
import { PaymentError } from 'src/payment/utils/payment-error.utils';

@Processor('processPayment')
@Injectable()
export class ProcessPaymentProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentSerice,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
    private readonly walletServcice: WalletService,
    private readonly orderPaymentService: OrderPaymentService,
  ) {}

  @Process('process-payment-job')
  async handleProcessPayment(job: Job) {
    const { paymentId } = job.data as { paymentId: string };
    const payment = await this.paymentService.getPaymentById(paymentId);

    if (!payment) {
      // TODO: log or move to dead letter queue
      return;
    }

    try {
      // Wrap entire payment processing in a transaction
      await this.prisma.$transaction(async (tx) => {
        await this.processPaymentWithTransaction(payment, tx);
      });
    } catch (err: unknown) {
      if (err instanceof PaymentError) {
        if (err.retryable) {
          // Retry by bull
          throw err;
        } else {
          // Non-retryable → manual refund + mark failed
          // Use separate transaction for failure handling
          await this.handlePaymentFailure(payment, err);
        }
      } else {
        // Unknown error → rethrow so Bull retries
        throw err;
      }
    }
  }

  private async processPaymentWithTransaction(
    payment: PaymentWithUserAndVendor,
    tx: Prisma.TransactionClient,
  ) {
    switch (payment.purpose) {
      case PaymentPurpose.SUBSCRIPTION_PURCHASE:
        if (!payment.user.vendor?.id) {
          throw new PaymentError(
            'Vendor not found for subscription purchase',
            false,
            'Missing vendorId',
          );
        }
        await this.vendorSubscriptionService.createVendorSubscription({
          payment,
          vendorId: payment.user.vendor.id,
          tx,
        });
        break;

      case PaymentPurpose.PRODUCT_PURCHASE:
        await this.orderPaymentService.createOrderPayment({
          payment,
          tx,
        });
        break;

      case PaymentPurpose.COIN_PURCHASE:
        if (!payment.user.vendor?.id) {
          throw new PaymentError(
            'Vendor not found for coin purchase',
            false,
            'Missing vendorId',
          );
        }
        await this.walletServcice.safeTopUpVendorWallet({
          vendorId: payment.user.vendor.id,
          payment,
        });
        break;

      default:
        throw new PaymentError(
          `Unsupported payment purpose: ${payment.purpose}`,
          false,
          'Invalid payment purpose',
        );
    }

    // Update payment status within the same transaction
    if (!PaymentPurpose.COIN_PURCHASE) {
      await this.paymentService.changePaymentStatus(
        payment.id,
        PaymentStatus.CHARGED,
        tx, // Pass transaction client
      );
    }
  }

  private async handlePaymentFailure(payment: Payment, err: PaymentError) {
    // Handle failure in a separate transaction
    await this.prisma.$transaction(async (tx) => {
      await this.createManualRefund({
        payment,
        reason: err.reason,
        userId: payment.userId,
        metaData: err.metaData,
        tx, // Pass transaction client
      });

      await this.paymentService.changePaymentStatus(
        payment.id,
        PaymentStatus.FAILED,
        tx, // Pass transaction client
      );
    });
  }

  private async createManualRefund({
    payment,
    reason,
    tx,
    userId,
    metaData,
  }: {
    payment: Payment;
    reason: string;
    tx?: Prisma.TransactionClient;
    userId: string;
    metaData?: Record<string, unknown>;
  }) {
    const prisma = tx || this.prisma;

    await prisma.manualRefund.create({
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        status: RefundStatus.PENDING,
        userId,
        reason,
        metaData: metaData as Prisma.InputJsonValue,
      },
    });
  }
}
