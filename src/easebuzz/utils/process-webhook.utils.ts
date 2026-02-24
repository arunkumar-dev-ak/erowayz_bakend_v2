import { PaymentStatus } from '@prisma/client';
import {
  EasebuzzWebhookDto,
  paymentStatusMap,
} from '../dto/easebuzz-webhook.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';

export const processWebHookUtils = async ({
  queueService,
  prismaService,
  body,
}: {
  queueService: QueueService;
  body: EasebuzzWebhookDto;
  prismaService: PrismaService;
}) => {
  const {
    txnid,
    status,
    mode,
    bankcode,
    bank_ref_num,
    card_type,
    cardnum,
    issuing_bank,
    error_Message,
    upi_va,
  } = body;

  const mappedStatus = paymentStatusMap[status] as PaymentStatus;

  if (mappedStatus === PaymentStatus.FAILED) {
    console.error(
      `Payment failed for tranactionId=${txnid}, status=${status}, reason=${error_Message || 'N/A'}`,
    );
  }

  const existingPayment = await prismaService.payment.findUnique({
    where: { txnid },
  });

  if (existingPayment) {
    const updatedPayment = await prismaService.payment.update({
      where: { txnid },
      data: {
        status:
          mappedStatus === PaymentStatus.CHARGED
            ? PaymentStatus.PROCESSING
            : mappedStatus,
        statusMessage: error_Message,
        cardType: card_type,
        cardLast4: cardnum,
        upiVa: upi_va,
        issuingBank: issuing_bank,
        mode,
        bankCode: bankcode,
        bankRefNum: bank_ref_num,
        // cashbackPercentage: cash_back_percentage,
        // deductionPercentage: deduction_percentage,
      },
      include: { user: { include: { vendor: true } } },
    });
    if (updatedPayment.status == PaymentStatus.PROCESSING) {
      await queueService.processPaymentJob(updatedPayment.id);
    }
  } else {
    console.log(`Skipping update: Existing Payment not found ${txnid}`);
    return existingPayment;
  }
};
