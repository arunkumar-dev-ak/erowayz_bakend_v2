import {
  Payment,
  Prisma,
  VendorSubscription,
  WalletTransactionType,
} from '@prisma/client';
import { VendorTopUpDto } from '../dto/vendor-topup.dto';
import { WalletService } from '../wallet.service';
import { BadRequestException } from '@nestjs/common';
import { PaymentError } from 'src/payment/utils/payment-error.utils';

export async function vendorTopUpPaymentInitiation({
  body,
  userId,
  vendorId,
  walletService,
  tx,
  coinsLimit,
  maxWalletPaymentInitiationCount,
}: {
  body: VendorTopUpDto;
  userId: string;
  vendorId: string;
  walletService: WalletService;
  tx: Prisma.TransactionClient;
  coinsLimit: number;
  maxWalletPaymentInitiationCount: number;
}) {
  const { coinsCount } = body;

  const [wallet, adminvendorLimit] = await Promise.all([
    walletService.createOrFindWallet(userId, tx),
    walletService.createOrFindAdminVendorLimit(vendorId, tx),
  ]);

  const paymentInitate = await walletService.checkWalletPaymentInitiationCount(
    userId,
    wallet.id,
  );
  if (paymentInitate > maxWalletPaymentInitiationCount) {
    throw new BadRequestException(
      'You have exceeded the limit for wallet payment initiation. Please try again after 5 minutes.',
    );
  }
  // checking coins limit
  if (coinsCount + adminvendorLimit.totalGiven > coinsLimit) {
    throw new BadRequestException('Coins limit exceeded');
  }

  return { wallet };
}

export async function VendorTopUpUtils({
  payment,
  userId,
  vendorId,
  walletService,
  tx,
  coinsLimit,
}: {
  payment: Payment;
  userId: string;
  vendorId: string;
  walletService: WalletService;
  tx: Prisma.TransactionClient;
  coinsLimit: number;
}) {
  //find the wallet
  //check if vendor is exceeding the limit
  //create a transcation
  //create or update the adminVendorLimit
  //topUp the wallet

  const coinsCount = payment.amount;

  const [wallet, adminvendorLimit] = await Promise.all([
    walletService.createOrFindWallet(userId, tx),
    walletService.createOrFindAdminVendorLimit(vendorId, tx),
  ]);

  // checking coins limit
  if (coinsCount + adminvendorLimit.totalGiven > coinsLimit) {
    throw new PaymentError(
      'Coins limit exceeded for vendor top-up',
      false,
      'Coins limit exceeded',
      {
        vendorId,
        userId,
        attemptedAmount: coinsCount,
        currentLimit: coinsLimit,
        totalGiven: adminvendorLimit.totalGiven,
      },
    );
  }

  const createTransactionQuery: Prisma.WalletTransactionCreateInput = {
    receiverWallet: {
      connect: { id: wallet.id },
    },
    payment: {
      connect: {
        id: payment.id,
      },
    },
    amount: coinsCount,
    transactionType: WalletTransactionType.ADMIN_TO_VENDOR,
    reason: 'VENDOR_TOP_UP',
  };

  const walletUpdateQuery: Prisma.WalletUpdateInput = {
    balance: { increment: coinsCount },
  };

  const adminVendorLimitUpdateQuery: Prisma.AdminVendorCreditUpdateInput = {
    totalGiven: { increment: coinsCount },
  };

  return {
    walletUpdateQuery,
    createTransactionQuery,
    adminVendorLimitUpdateQuery,
    wallet,
    adminvendorLimit,
  };
}

export function getCoinsLimit({
  currentSubscription,
}: {
  currentSubscription: VendorSubscription;
}) {
  const coinsLimit = (currentSubscription.planFeatures as Record<string, any>)[
    'coinsLimitations'
  ] as number | null;
  if (!coinsLimit) {
    throw new BadRequestException('You are not allowed to use the coins');
  }

  return coinsLimit;
}
