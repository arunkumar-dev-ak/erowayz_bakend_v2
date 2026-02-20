import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentPurpose, PaymentStatus, Prisma, User } from '@prisma/client';
import axios from 'axios';
import { createHash } from 'crypto';
import {
  EasebuzzInitiateResponseInterface,
  EaseBuzzTransactionRetrievalInterface,
} from './interface/easebuzz.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUniqueOrderId } from './utils/payment.utils';
import { GetEaseBuzzPaymentDto } from './dto/get-easebuzz.dto';
import { Response } from 'express';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class EasebuzzService {
  private merchatKey?: string;
  private secret?: string;
  private initiateApi?: string;
  private verifyApi?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {
    this.merchatKey = configService.get('EASEBUZZ_MERCHANT_KEY');
    this.secret = configService.get('EASEBUZZ_SECRET');
    this.initiateApi = configService.get('INITIATE_API');
    this.verifyApi = configService.get('VERIFY_API');
  }

  checkKey(key: keyof EasebuzzService) {
    const value = this[key];

    if (value === undefined || value === null) {
      throw new BadRequestException(`${String(key)} not found`);
    }

    return value;
  }

  /*-----

    key:DYR0FJ52AU
    txnid:d465d064-9220-4610-be0a-206db7ebc263
    amount:2
    productinfo:testing
    firstname:Arun
    phone:6369913564
    email:arunkumar.ak.dev@gmail.com
    surl:https://erowayz.in/
    furl:https://erowayz.in/index.php/contact-us/
    hash:ae0375d58948a778127e26425bc342f629fb1943e6306e5d2225bb5d12c6eb8c16968bc76d2575b3b37256bcc80c51402a06125b3157a0001d64beaaf46bedae

   ------*/

  async initiatePayment(params: {
    amount: number;
    user: User;
    referenceId: string;
    paymentPurpose: PaymentPurpose;
  }) {
    for (const key of [
      'merchatKey',
      'secret',
      'initiateApi',
      'verifyApi',
    ] as const) {
      this.checkKey(key as keyof EasebuzzService);
    }

    const uniqueOrderId = createUniqueOrderId();
    const amount = params.amount.toFixed(2);
    const hash = this.generateHash({
      txnid: uniqueOrderId,
      amount,
      firstname: params.user.name,
      email: params.user.email ?? '',
      productinfo: 'paymentPage',
      udf1: params.paymentPurpose,
      udf6: params.referenceId,
    });

    const initiatePayload = {
      key: this.merchatKey,
      txnid: uniqueOrderId,
      amount,
      email: params.user.email,
      phone: params.user.mobile,
      surl: 'https://erowayz.in/',
      furl: 'https://erowayz.in/index.php/contact-us/',
      unique_id: params.user.id.replaceAll('-', '_'),
      productinfo: 'paymentPage',
      firstname: params.user.name,
      udf1: params.paymentPurpose,
      udf6: params.referenceId,
      hash,
    };

    try {
      const { data } = await axios.post<EasebuzzInitiateResponseInterface>(
        `${this.initiateApi}/payment/initiateLink`,
        initiatePayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (data.status !== 1) {
        throw new BadRequestException(
          data.error_desc || 'Payment initiation failed',
        );
      }

      return {
        ...(await this.retrieveTransactionByTransactionId(uniqueOrderId)),
        accessKey: data.data,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError<EasebuzzInitiateResponseInterface>(error)) {
        const gatewayError =
          error.response?.data?.error_desc ??
          error.response?.data?.data ??
          error.message;

        throw new BadRequestException(gatewayError || 'Easebuzz API error');
      }

      throw new BadRequestException('Unexpected payment error');
    }
  }

  async retrieveTransactionByTransactionId(txnId: string) {
    const hash = this.generateHashForTransactionRetrieval({
      txnid: txnId,
    });

    const payload = {
      key: this.merchatKey,
      txnid: txnId,
      hash,
    };

    try {
      const response = await axios.post<EaseBuzzTransactionRetrievalInterface>(
        `${this.verifyApi}/transaction/v2.1/retrieve`,
        payload,
      );

      const data = response.data;

      if (!data.status) {
        throw new BadRequestException('Transaction retrieval failed');
      }

      //retrieving last transaction
      return {
        transaction: data.msg[data.msg.length - 1],
      };
    } catch (error: unknown) {
      if (axios.isAxiosError<EaseBuzzTransactionRetrievalInterface>(error)) {
        const gatewayError = error.response?.data?.msg ?? error.message;

        throw new BadRequestException(gatewayError || 'Easebuzz API error');
      }

      throw new BadRequestException('Unexpected payment error');
    }
  }

  async handleCheckPayment({
    body,
    res,
  }: {
    body: GetEaseBuzzPaymentDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { txnId } = body;

    const txnDetails = await this.retrieveTransactionByTransactionId(txnId);

    return this.response.successResponse({
      res,
      data: txnDetails,
      message: 'Transaction retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getPaymentForCoinsByVendor(vendorUserId: string) {
    return await this.prisma.payment.findFirst({
      where: {
        userId: vendorUserId,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.COIN_PURCHASE,
      },
    });
  }

  private generateHash(params: {
    txnid: string;
    amount: string;
    firstname: string;
    email: string;
    productinfo: string;
    udf1?: string;
    udf6?: string;
  }) {
    const hashString =
      `${this.merchatKey}|${params.txnid}|${params.amount}|${params.productinfo}|` +
      `${params.firstname}|${params.email}|` +
      `${params.udf1 || ''}|` + // udf1
      `|` + // udf2
      `|` + // udf3
      `|` + // udf4
      `|` + // udf5
      `${params.udf6 || ''}|` + // udf6
      `|` + // udf7
      `|` + // udf8
      `|` + // udf9
      `|` + // udf10
      `${this.secret}`;

    return createHash('sha512').update(hashString).digest('hex');
  }

  private generateHashForTransactionRetrieval(params: { txnid: string }) {
    const hashString = `${this.merchatKey}|${params.txnid}|${this.secret}`;

    return createHash('sha512').update(hashString).digest('hex');
  }

  async changePaymentStatus(
    paymentId: string,
    paymentStatus: PaymentStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const prismaClient = this.prisma ?? tx;
    await prismaClient.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: paymentStatus,
      },
    });
  }
}
