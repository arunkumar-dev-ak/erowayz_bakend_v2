import { Injectable } from '@nestjs/common';
import { Payment, Prisma, RefundStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class ManualRefundService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
  ) {}

  async createOrGetForSubscribtion({
    payment,
    reason,
    tx,
  }: {
    payment: Payment;
    reason: string;
    tx?: Prisma.TransactionClient;
  }) {
    const prisma = tx ?? this.prisma;

    const existingRefund = await this.getManualRefundByPaymentId(payment.id);
    if (existingRefund) {
      return existingRefund;
    }

    // const newRefund = await prisma.manualRefund.create({
    //   data: {
    //     paymentId: payment.id,
    //     amount: payment.amount,
    //     status: RefundStatus.PENDING,
    //     reason,
    //   },
    // });

    // return newRefund;
  }

  /*----- helper func -----*/
  async getManualRefundByPaymentId(paymentId: string) {
    return await this.prisma.manualRefund.findFirst({
      where: {
        paymentId,
      },
    });
  }
}
