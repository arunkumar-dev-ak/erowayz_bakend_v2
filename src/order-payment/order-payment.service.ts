import { Injectable } from '@nestjs/common';
import { OrderPaymentType, Payment, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentError } from 'src/payment/utils/payment-error.utils';

@Injectable()
export class OrderPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderPayment({
    payment,
    tx,
  }: {
    tx?: Prisma.TransactionClient;
    payment: Payment;
  }) {
    const orderId = payment.referenceId;

    const existingOrder = await this.getOrderWithOrderPayment(orderId);

    if (!existingOrder) {
      throw new PaymentError('Order does not exist', false, 'Missing order', {
        orderId,
      });
    }

    if (existingOrder.orderPayment) {
      throw new PaymentError(
        'Order payment already exists',
        false,
        'Duplicate order payment',
        {
          orderId,
          orderPayment: existingOrder.orderPayment,
        },
      );
    }

    await (tx || this.prisma).orderPayment.create({
      data: {
        orderId,
        paymentId: payment.id,
        paidedAmount: payment.amount,
        type: OrderPaymentType.JUSPAY,
      },
    });

    return;
  }

  /*----- helper func ----*/
  async getOrderWithOrderPayment(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderPayment: true },
    });
  }
}
