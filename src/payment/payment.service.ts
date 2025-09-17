import { PaymentPurpose, PaymentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

export class PaymentSerice {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {}

  async getTransactionForAdmin() {}

  async getTransactionForUser() {}

  /*----- helper func -----*/
  async getPaymentByOrderId(orderId: string) {
    await this.prisma.payment.findUnique({
      where: {
        juspayOrderId: orderId,
      },
    });
  }

  async getPaymentForCoinsByVendor(vendorUserId: string) {
    return await this.prisma.payment.findFirst({
      where: {
        userId: vendorUserId,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.COIN_PURCHASE,
      },
    });
  }

  async getPaymentById(paymentId: string) {
    return await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        user: {
          include: {
            vendor: true,
          },
        },
      },
    });
  }

  async changePaymentStatus(paymentId: string, paymentStatus: PaymentStatus) {
    await this.prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: paymentStatus,
      },
    });
  }
}
