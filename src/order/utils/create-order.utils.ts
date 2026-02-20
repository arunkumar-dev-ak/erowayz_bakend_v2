import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EasebuzzService } from 'src/easebuzz/easebuzz.service';
import { WalletService } from 'src/wallet/wallet.service';

export const lockVendorAndCustomerWallet = async ({
  customerUserId,
  vendorUserId,
  walletService,
  tx,
  payableAmount,
  vendorWalletBalanceLimit,
  easebuzzService,
}: {
  customerUserId: string;
  vendorUserId: string;
  walletService: WalletService;
  tx: Prisma.TransactionClient;
  payableAmount: number;
  vendorWalletBalanceLimit: number;
  easebuzzService: EasebuzzService;
}) => {
  //check the customer wallet balance
  //check customer wallet is locked
  //check the vendor wallet balance and locked balance and requested amount
  //lock the customer wallet
  //increase locked balance of vendor

  const [vendorWallet, customerWallet] = await Promise.all([
    walletService.createOrFindWallet(vendorUserId, tx),
    walletService.createOrFindWallet(customerUserId, tx),
  ]);

  const finalPayableAmount = Math.round(payableAmount);

  //check customer wallet
  if (customerWallet.locked) {
    throw new BadRequestException('Customer wallet is currently locked');
  }
  if (customerWallet.balance < finalPayableAmount) {
    throw new BadRequestException(
      'Insufficient wallet balance to complete the transaction.',
    );
  }

  //check vendor wallet
  const vendorBalance = vendorWallet.balance;
  const vendorLockedBalance = vendorWallet.lockedBalance;
  const vendorPaymentReqForCoins =
    await easebuzzService.getPaymentForCoinsByVendor(vendorUserId);

  const finalLockedBalance =
    vendorBalance +
    vendorLockedBalance +
    (vendorPaymentReqForCoins?.amount || 0) +
    finalPayableAmount;

  if (finalLockedBalance > vendorWalletBalanceLimit) {
    throw new BadRequestException(
      'The vendor is currently not accepting coin payments. Please try again later.',
    );
  }

  //wallet updates
  const vendorWalletUpdateQuery: Prisma.WalletUpdateInput = {
    lockedBalance: { increment: finalPayableAmount },
  };

  const customerWalletUpdateQuery: Prisma.WalletUpdateInput = {
    locked: true,
  };

  return { vendorWalletUpdateQuery, customerWalletUpdateQuery };
};
