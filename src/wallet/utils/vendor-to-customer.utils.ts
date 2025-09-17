import { Prisma, Role, User, WalletTransactionType } from '@prisma/client';
import { VendorTransferToCustomerDto } from '../dto/vendor-to-customer.dto';
import { WalletService } from '../wallet.service';
import { UserService } from 'src/user/user.service';
import { BadRequestException } from '@nestjs/common';

export async function VendorToCustomerTransferUtils({
  body,
  vendorUserId,
  walletService,
  tx,
  userService,
}: {
  body: VendorTransferToCustomerDto;
  vendorUserId: string;
  walletService: WalletService;
  tx: Prisma.TransactionClient;
  userService: UserService;
}) {
  //check customerUserId is valid and he is in active and also he is an customer
  //check vendor balance
  //create or get customer wallet
  //create wallet transaction
  //toup customer wallet
  //deduct from vendorWallet
  const { coinsCount, customerUserId } = body;

  const customer = await userService.fetchUserById(customerUserId);
  if (!customer) {
    throw new BadRequestException('Customer not found');
  }
  validateCustomer(customer);

  const [vendorWallet, customerWallet] = await Promise.all([
    walletService.createOrFindWallet(vendorUserId, tx),
    walletService.createOrFindWallet(customerUserId, tx),
  ]);

  if (coinsCount > vendorWallet.balance) {
    throw new BadRequestException(
      `Insufficient balance. Vendor has only ${vendorWallet.balance} coins, but tried to transfer ${coinsCount}`,
    );
  }

  const createTransactionQuery: Prisma.WalletTransactionCreateInput = {
    receiverWallet: {
      connect: { id: customerWallet.id },
    },
    senderWallet: {
      connect: {
        id: vendorWallet.id,
      },
    },
    amount: coinsCount,
    transactionType: WalletTransactionType.VENDOR_TO_CUSTOMER,
    reason: 'VENDOR_TRANSFER_TO_CUSTOMER',
  };

  const vendorWalletUpdateQuery: Prisma.WalletUpdateInput = {
    balance: { decrement: coinsCount },
  };

  const customerWalletUpdateQuery: Prisma.WalletUpdateInput = {
    balance: { increment: coinsCount },
  };

  return {
    customerWalletUpdateQuery,
    createTransactionQuery,
    vendorWalletUpdateQuery,
    vendorWallet,
    customerWallet,
  };
}

function validateCustomer(customer: User) {
  const isInactive = customer.status === false;
  const isCustomer = customer.role === Role.CUSTOMER;

  if (isInactive) {
    throw new BadRequestException('Customer account is currently inactive');
  }
  if (!isCustomer) {
    throw new BadRequestException(
      `${customer.name} is a ${customer.role}.You can only transfer to customer`,
    );
  }
}
