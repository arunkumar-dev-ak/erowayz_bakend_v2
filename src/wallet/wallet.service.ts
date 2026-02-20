import { Injectable } from '@nestjs/common';
import {
  Payment,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  VendorSubscription,
} from '@prisma/client';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { VendorTopUpDto } from './dto/vendor-topup.dto';
import {
  getCoinsLimit,
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
import { GetWalletTransactionQueryForAdminDto } from './dto/get-wallet-transaction-query.dto';
import { buildWalletTransactiontWhereFilter } from './utils/get-wallet-transaction.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
import { EasebuzzService } from 'src/easebuzz/easebuzz.service';

@Injectable()
export class WalletService {
  private readonly MAX_RETRIES: number;
  private readonly maxWalletPaymentInitiationCount: number;
  private readonly customerWalletLimit: number;
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly easebuzzService: EasebuzzService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {
    this.MAX_RETRIES = parseInt(
      configService.get<string>('ISOLATION_LEVEL_MAX_RETRIES') || '3',
    );
    this.maxWalletPaymentInitiationCount = parseInt(
      configService.get<string>('MAX_WALLET_INITIATION_COUNT') || '3',
    );
    this.customerWalletLimit = parseInt(
      configService.get<string>('CUSTOMER_COIN_LIMIT') || '200',
    );
  }

  async getWalletForUser({ userId, res }: { userId: string; res: Response }) {
    const initialDate = new Date();

    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
            vendor: {
              select: {
                adminVendorCredit: true,
              },
            },
          },
        },
      },
    });

    return this.response.successResponse({
      initialDate,
      data: wallet,
      res,
      message: 'Wallet retrieved successfully',
      statusCode: 201,
    });
  }

  async getWalletTransaction({
    res,
    query,
    offset,
    limit,
    origin,
  }: {
    res: Response;
    query: GetWalletTransactionQueryForAdminDto;
    offset: number;
    limit: number;
    origin: 'USER' | 'ADMIN';
  }) {
    const initialDate = new Date();
    const { where } = buildWalletTransactiontWhereFilter({
      query,
    });

    const totalCount = await this.prisma.walletTransaction.count({ where });

    const walletTransaction = await this.prisma.walletTransaction.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderPayment: {
          include: {
            order: true,
          },
        },
        coinsSettlement: {
          include: {
            coinsSettlementFile: true,
          },
        },
        senderWallet: {
          include: {
            user: {
              select: {
                name: true,
                nameTamil: true,
                vendor: {
                  include: {
                    shopInfo: true,
                  },
                },
              },
            },
          },
        },
        receiverWallet: {
          include: {
            user: {
              select: {
                name: true,
                nameTamil: true,
                vendor: {
                  include: {
                    shopInfo: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    const { shopName, vendorId, userId, userName, startDate, endDate } = query;
    const queries = buildQueryParams({
      shopName,
      vendorId,
      userId,
      userName,
      startDate,
      endDate,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `wallet/walletTransaction/${origin == 'ADMIN' ? 'admin' : 'user'}`,
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: walletTransaction,
      meta,
      message: 'Wallet Transaction retrieved successfully',
      statusCode: 200,
    });
  }

  async walletTopUpReq({
    userId,
    vendorId,
    res,
    body,
    currentSubscription,
  }: {
    userId: string;
    vendorId: string;
    res: Response;
    body: VendorTopUpDto;
    currentSubscription: VendorSubscription;
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
            coinsLimit: getCoinsLimit({ currentSubscription }),
            maxWalletPaymentInitiationCount:
              this.maxWalletPaymentInitiationCount,
          });

          const { transaction, accessKey } =
            await this.easebuzzService.initiatePayment({
              amount: body.coinsCount,
              user: wallet.user,
              referenceId: wallet.id,
              paymentPurpose: PaymentPurpose.COIN_PURCHASE,
            });

          if (!transaction) {
            return;
          }

          const paymentPageExpiry = new Date(
            new Date(transaction.addedon.replace(' ', 'T') + 'Z').getTime() +
              5 * 60 * 1000,
          );

          const payment = await tx.payment.create({
            data: {
              easepayid: transaction.easepayid,
              txnid: transaction.txnid,
              amount: body.coinsCount,
              accessKey,
              purpose: PaymentPurpose.COIN_PURCHASE,
              referenceId: wallet.id,
              paymentPageExpiry,
              status: 'PENDING',
              user: {
                connect: {
                  id: userId,
                },
              },
              responseHash: transaction.hash,
            },
          });

          const {
            txnid,
            firstname,
            email,
            phone,
            addedon,
            easepayid,
            amount,
            surl,
            furl,
            status,
          } = transaction;

          return this.response.successResponse({
            initialDate,
            data: {
              ...payment,
              sdkPayload: {
                txnid,
                firstname,
                email,
                phone,
                addedon,
                easepayid,
                amount,
                surl,
                furl,
                status,
              },
            },
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

            await this.easebuzzService.changePaymentStatus(
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
              coinsLimit: this.customerWalletLimit,
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
