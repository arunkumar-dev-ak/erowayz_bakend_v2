import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Job } from 'bull';
import { PaymentSerice } from 'src/payment/payment.service';
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
          });
          break;

        case PaymentPurpose.PRODUCT_PURCHASE:
          await this.orderPaymentService.createOrderPayment({
            payment,
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

      await this.paymentService.changePaymentStatus(
        payment.id,
        PaymentStatus.CHARGED,
      );
    } catch (err: unknown) {
      if (err instanceof PaymentError) {
        if (err.retryable) {
          //retry by bull
          throw err;
        } else {
          // Non-retryable → manual refund + mark failed
          await this.createManualRefund({
            payment,
            reason: err.reason,
            userId: payment.userId,
            metaData: err.metaData,
          });

          await this.paymentService.changePaymentStatus(
            payment.id,
            PaymentStatus.FAILED,
          );
        }
      } else {
        // Unknown error → rethrow so Bull retries
        throw err;
      }
    }
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
