import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ErrorLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logPaymentError({
    tx,
    referenceId,
    vendorUserId,
    customerUserId,
    errorType,
    message,
    metaData,
  }: {
    referenceId: string;
    vendorUserId: string;
    customerUserId?: string;
    errorType: string;
    message: string;
    metaData?: Record<string, any>;
    tx?: Prisma.TransactionClient;
  }) {
    const prisma = tx ?? this.prisma;
    await prisma.paymentErrorLog.create({
      data: {
        referenceId,
        vendorUserId,
        customerUserId,
        errorType,
        message,
        metaData,
      },
    });
  }
}
