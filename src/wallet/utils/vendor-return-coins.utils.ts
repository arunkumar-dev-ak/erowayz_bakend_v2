import { Prisma, WalletTransactionType } from '@prisma/client';
import { VendorTopUpDto } from '../dto/vendor-topup.dto';
import { WalletService } from '../wallet.service';
import { BadRequestException } from '@nestjs/common';

export async function VendorReturnCoinsUtils({
  body,
  userId,
  vendorId,
  walletService,
  tx,
}: {
  body: VendorTopUpDto;
  userId: string;
  vendorId: string;
  walletService: WalletService;
  tx: Prisma.TransactionClient;
}) {
  //check vendor wallet
  //check wallet has that much of requested coins
  //create wallet transaction
  //update wallet
  //update adminVendorLimit

  const { coinsCount } = body;

  const [wallet, adminvendorLimit] = await Promise.all([
    walletService.createOrFindWallet(userId, tx),
    walletService.createOrFindAdminVendorLimit(vendorId, tx),
  ]);

  if (coinsCount > wallet.balance) {
    throw new BadRequestException(
      `Wallet has an balance of only ${wallet.balance}`,
    );
  }

  const createTransactionQuery: Prisma.WalletTransactionCreateInput = {
    senderWallet: {
      connect: { id: wallet.id },
    },
    amount: coinsCount,
    transactionType: WalletTransactionType.VENDOR_TO_ADMIN_REFUND,
    reason: 'VENDOR_RETURN',
  };

  const walletUpdateQuery: Prisma.WalletUpdateInput = {
    balance: { decrement: coinsCount },
  };

  const adminVendorLimitUpdateQuery: Prisma.AdminVendorCreditUpdateInput = {
    totalGiven: { decrement: coinsCount },
  };

  return {
    walletUpdateQuery,
    createTransactionQuery,
    adminVendorLimitUpdateQuery,
    wallet,
    adminvendorLimit,
  };
}
