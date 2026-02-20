import {
  Payment,
  Prisma,
  RefundStatus,
  SubscriptionPlan,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { VendorSubscriptionService } from '../vendor-subscription.service';
import { PaymentError } from 'src/easebuzz/utils/payment-error.utils';

export async function getSubscriptionPlanOrThrow(
  referenceId: string,
  subscriptionService: SubscriptionService,
): Promise<SubscriptionPlan> {
  const plan = await subscriptionService.getSubPlanById(referenceId);
  if (!plan)
    throw new PaymentError(
      'Subscription plan not found',
      false,
      'Invalid subscription plan',
    );
  return plan;
}

export function calculateEndDate(start: Date, billingPeriod: string): Date {
  const end = new Date(start);
  switch (billingPeriod) {
    case 'MONTHLY':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'WEEKLY':
      end.setDate(end.getDate() + 7);
      break;
    default:
      throw new Error(`Unknown billing period: ${billingPeriod}`);
  }
  return end;
}

export async function createManualRefund({
  payment,
  reason,
  prismaService,
  tx,
  userId,
  metaData,
}: {
  payment: Payment;
  reason: string;
  prismaService: PrismaService;
  tx?: Prisma.TransactionClient;
  userId: string;
  metaData?: Record<string, unknown>;
}) {
  const prisma = tx || prismaService;
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

export async function checkCurrentAndFutureSubscription({
  vendorSubscriptionService,
  vendorId,
}: {
  vendorSubscriptionService: VendorSubscriptionService;
  vendorId: string;
}) {
  const [existingSubscriptionPlan, futureVendorSubscription] =
    await Promise.all([
      vendorSubscriptionService.checkCurrentVendorSubscription({
        vendorId,
      }),
      vendorSubscriptionService.checkFutureVendorSubscription({
        vendorId,
      }),
    ]);

  return { existingSubscriptionPlan, futureVendorSubscription };
}
