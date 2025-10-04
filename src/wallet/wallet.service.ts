import { Injectable } from '@nestjs/common';
import { Payment, PaymentPurpose, PaymentStatus, Prisma } from '@prisma/client';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { VendorTopUpDto } from './dto/vendor-topup.dto';
import {
  vendorTopUpPaymentInitiation,
  VendorTopUpUtils,
} from './utils/vendor-topup.utils';
import { VendorReturnCoinsUtils } from './utils/vendor-return-coins.utils';
import { VendorToCustomerTransferUtils } from './utils/vendor-to-customer.utils';
import { VendorTransferToCustomerDto } from './dto/vendor-to-customer.dto';
import { UserService } from 'src/user/user.service';
import {
  isSerializationError,
  randomJitter,
  sleep,
} from 'src/common/functions/isolation-retry-functions';
import { ConfigService } from '@nestjs/config';
import { PaymentJuspayService } from 'src/payment/payment.juspay.service';
import { JuspayOrderResponse } from 'src/payment/dto/juspay-webhook.dto';
import { PaymentSerice } from 'src/payment/payment.service';

@Injectable()
export class WalletService {
  private readonly MAX_RETRIES: number;
  private readonly maxWalletPaymentInitiationCount: number;
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly paymentJuspayService: PaymentJuspayService,
    private readonly paymentService: PaymentSerice,
  ) {
    this.MAX_RETRIES = parseInt(
      configService.get<string>('ISOLATION_LEVEL_MAX_RETRIES') || '3',
    );
    this.maxWalletPaymentInitiationCount = parseInt(
      configService.get<string>('MAX_WALLET_INITIATION_COUNT') || '3',
    );
  }

  async walletTopUpReq({
    userId,
    vendorId,
    res,
    body,
  }: {
    userId: string;
    vendorId: string;
    res: Response;
    body: VendorTopUpDto;
  }) {
    const initialDate = new Date();
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const { wallet } = await vendorTopUpPaymentInitiation({
            body,
            userId,
            vendorId,
            tx,
            walletService: this,
            coinsLimit: 2000,
            maxWalletPaymentInitiationCount:
              this.maxWalletPaymentInitiationCount,
          });

          const jusPayOrder: JuspayOrderResponse | undefined =
            await this.paymentJuspayService.createOrder({
              amount: body.coinsCount,
              user: wallet.user,
              referenceId: wallet.id,
              paymentPurpose: PaymentPurpose.COIN_PURCHASE,
            });

          if (!jusPayOrder) {
            return;
          }

          const payment = await tx.payment.create({
            data: {
              juspayOrderId: jusPayOrder.id,
              orderId: jusPayOrder.order_id,
              amount: body.coinsCount,
              purpose: PaymentPurpose.COIN_PURCHASE,
              referenceId: wallet.id,
              status: 'PENDING',
              userId: userId,
              paymentLinkWeb: jusPayOrder.payment_links.web,
              paymentPageExpiry: new Date(jusPayOrder.payment_links.expiry),
            },
          });

          return this.response.successResponse({
            initialDate,
            data: { ...payment, ...jusPayOrder.sdk_payload },
            res,
            message: 'Payment initiated successfully',
            statusCode: 200,
          });
        });
      } catch (err: any) {
        if (isSerializationError(err)) {
          const delay = randomJitter(100 * 2 ** attempt);
          console.warn(
            `Retrying transaction due to serialization error (attempt ${
              attempt + 1
            }), waiting ${delay}ms`,
          );
          await sleep(delay);
          continue;
        }

        throw err;
      }
    }
  }

  async safeTopUpVendorWallet({
    payment,
    vendorId,
  }: {
    payment: Payment;
    vendorId: string;
  }) {
    const userId = payment.userId;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const wallet = await this.prisma.$transaction(
          async (tx) => {
            const {
              walletUpdateQuery,
              createTransactionQuery,
              adminVendorLimitUpdateQuery,
              wallet,
              adminvendorLimit,
            } = await VendorTopUpUtils({
              userId,
              vendorId,
              payment,
              walletService: this,
              tx,
              coinsLimit: 2000,
            });

            const updatedWallet = await tx.wallet.update({
              where: { id: wallet.id },
              data: walletUpdateQuery,
            });

            await tx.adminVendorCredit.update({
              where: { id: adminvendorLimit.id },
              data: adminVendorLimitUpdateQuery,
            });

            await tx.walletTransaction.create({
              data: createTransactionQuery,
            });

            await this.paymentService.changePaymentStatus(
              payment.id,
              PaymentStatus.CHARGED,
              tx,
            );

            return updatedWallet;
          },
          {
            isolationLevel: 'Serializable',
          },
        );

        return wallet;
      } catch (err: any) {
        if (isSerializationError(err)) {
          const delay = randomJitter(100 * 2 ** attempt);
          console.warn(
            `Retrying transaction due to serialization error (attempt ${
              attempt + 1
            }), waiting ${delay}ms`,
          );
          await sleep(delay);
          continue;
        }

        throw err;
      }
    }

    throw new Error('Top-up failed after maximum retry attempts');
  }

  async safeReturnCoinsOfVendor({
    userId,
    vendorId,
    res,
    body,
    maxRetries = 3,
  }: {
    userId: string;
    vendorId: string;
    res: Response;
    body: VendorTopUpDto;
    maxRetries?: number;
  }) {
    const initialDate = new Date();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const wallet = await this.prisma.$transaction(
          async (tx) => {
            const {
              walletUpdateQuery,
              createTransactionQuery,
              adminVendorLimitUpdateQuery,
              wallet,
              adminvendorLimit,
            } = await VendorReturnCoinsUtils({
              userId,
              vendorId,
              body,
              walletService: this,
              tx,
            });

            const updatedWallet = await tx.wallet.update({
              where: { id: wallet.id },
              data: walletUpdateQuery,
            });

            await tx.adminVendorCredit.update({
              where: { id: adminvendorLimit.id },
              data: adminVendorLimitUpdateQuery,
            });

            await tx.walletTransaction.create({
              data: createTransactionQuery,
            });

            return updatedWallet;
          },
          {
            isolationLevel: 'Serializable',
          },
        );

        return this.response.successResponse({
          initialDate,
          data: wallet,
          res,
          message: 'Coins returned successfully',
          statusCode: 201,
        });
      } catch (err: any) {
        if (isSerializationError(err)) {
          const delay = randomJitter(100 * 2 ** attempt);
          console.warn(
            `Serialization conflict, retrying attempt ${attempt + 1} after ${delay}ms`,
          );
          await sleep(delay);
          continue;
        }

        console.error('Return failed:', err);
        throw err;
      }
    }

    throw new Error('Return failed after maximum retry attempts');
  }

  async safeVendorToCustomerTransfer({
    vendorUserId,
    res,
    body,
    maxRetries = 3,
  }: {
    vendorUserId: string;
    res: Response;
    body: VendorTransferToCustomerDto;
    maxRetries?: number;
  }) {
    const initialDate = new Date();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const wallet = await this.prisma.$transaction(
          async (tx) => {
            const {
              customerWalletUpdateQuery,
              vendorWalletUpdateQuery,
              createTransactionQuery,
              vendorWallet,
              customerWallet,
            } = await VendorToCustomerTransferUtils({
              vendorUserId,
              body,
              userService: this.userService,
              walletService: this,
              tx,
            });

            const updatedVendorWallet = await tx.wallet.update({
              where: { id: vendorWallet.id },
              data: vendorWalletUpdateQuery,
            });

            const updatedCustomerWallet = await tx.wallet.update({
              where: { id: customerWallet.id },
              data: customerWalletUpdateQuery,
            });

            await tx.walletTransaction.create({
              data: createTransactionQuery,
            });

            return { updatedVendorWallet, updatedCustomerWallet };
          },
          {
            isolationLevel: 'Serializable',
          },
        );

        return this.response.successResponse({
          initialDate,
          data: wallet,
          res,
          message: 'Coins returned successfully',
          statusCode: 201,
        });
      } catch (err: any) {
        if (isSerializationError(err)) {
          const delay = randomJitter(100 * 2 ** attempt);
          console.warn(
            `Serialization conflict, retrying attempt ${attempt + 1} after ${delay}ms`,
          );
          await sleep(delay);
          continue;
        }

        console.error('Return failed:', err);
        throw err;
      }
    }

    throw new Error('Return failed after maximum retry attempts');
  }

  /*----- hepler func -----*/
  async createOrFindWallet(userId: string, tx: Prisma.TransactionClient) {
    let wallet = await tx.wallet.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId },
        include: {
          user: true,
        },
      });
    }

    return wallet;
  }

  async createOrFindAdminVendorLimit(
    vendorId: string,
    tx: Prisma.TransactionClient,
  ) {
    let adminVendorLimit = await tx.adminVendorCredit.findUnique({
      where: { vendorId },
    });

    if (!adminVendorLimit) {
      adminVendorLimit = await tx.adminVendorCredit.create({
        data: { vendorId },
      });
    }

    return adminVendorLimit;
  }

  async checkWalletPaymentInitiationCount(userId: string, walletId: string) {
    const currentDate = new Date();

    return await this.prisma.payment.count({
      where: {
        userId,
        purpose: PaymentPurpose.COIN_PURCHASE,
        status: PaymentStatus.PENDING,
        paymentPageExpiry: {
          gt: currentDate,
        },
        referenceId: walletId,
      },
    });
  }
}
