import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PaymentPurpose, PaymentStatus, User } from '@prisma/client';
import { createUniqueOrderId } from './utils/payment.utils';
import { ResponseService } from 'src/response/response.service';
import { GetPaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';
import {
  card,
  JuspayOrderResponse,
  JuspayOrderStatus,
  order,
  txn_detail,
} from './dto/juspay-webhook.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';

export const paymentStatusMap: Record<JuspayOrderStatus, PaymentStatus> = {
  [JuspayOrderStatus.NEW]: PaymentStatus.PENDING,
  [JuspayOrderStatus.PENDING_VBV]: PaymentStatus.PENDING,
  [JuspayOrderStatus.AUTHENTICATION_FAILED]: PaymentStatus.FAILED,
  [JuspayOrderStatus.AUTHORIZATION_FAILED]: PaymentStatus.FAILED,
  [JuspayOrderStatus.JUSPAY_DECLINED]: PaymentStatus.FAILED,
  [JuspayOrderStatus.CHARGED]: PaymentStatus.CHARGED,
  [JuspayOrderStatus.AUTHORIZING]: PaymentStatus.PENDING,
  [JuspayOrderStatus.STARTED]: PaymentStatus.PENDING,
  [JuspayOrderStatus.AUTO_REFUNDED]: PaymentStatus.FAILED,
  [JuspayOrderStatus.PARTIAL_CHARGED]: PaymentStatus.CHARGED,
  [JuspayOrderStatus.AUTHORIZED]: PaymentStatus.PENDING,
  [JuspayOrderStatus.CAPTURE_INITIATED]: PaymentStatus.PENDING,
  [JuspayOrderStatus.CAPTURE_FAILED]: PaymentStatus.FAILED,
  [JuspayOrderStatus.VOIDED]: PaymentStatus.FAILED,
  [JuspayOrderStatus.VOID_INITIATED]: PaymentStatus.PENDING,
  [JuspayOrderStatus.VOID_FAILED]: PaymentStatus.FAILED,
  [JuspayOrderStatus.COD_INITIATED]: PaymentStatus.PENDING,
  [JuspayOrderStatus.NOT_FOUND]: PaymentStatus.FAILED,
};

@Injectable()
export class PaymentJuspayService {
  private merchantId?: string;
  private baseUrl: string;
  private apiKey?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {
    this.merchantId = configService.get('JUSPAY_MERCHANT_ID');
    this.baseUrl = 'https://api.juspay.in';
    this.apiKey = configService.get('JUSPAY_APIKEY');
  }

  checkMerchantId() {
    if (!this.merchantId || this.merchantId === null) {
      throw new BadRequestException('MerchantId not found');
    }
  }

  checkApiKey() {
    if (!this.apiKey || this.apiKey === null) {
      throw new BadRequestException('Api Key not found');
    }
  }

  async fetchOrder({ body, res }: { body: GetPaymentDto; res: Response }) {
    const initialDate = new Date();

    const { orderId } = body;
    this.checkApiKey();
    try {
      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        auth: {
          username: this.apiKey!,
          password: '',
        },
      });

      const responseData: order = response.data;

      const updatedOrCreatePayment = await this.handleJuspayResponse({
        order: responseData,
        txn_detail: responseData.txn_detail,
        card: responseData.card,
      });

      return this.responseService.successResponse({
        initialDate,
        res,
        data: responseData,
        message: 'Order fetched successfully',
        statusCode: 200,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }

    //check and save
    // const payment = await this.paymentService.getPaymentByOrderId(
    //   responseData.order.id,
    // );
  }

  async createOrder(params: {
    amount: number;
    user: User;
    referenceId: string;
    paymentPurpose: PaymentPurpose;
  }) {
    this.checkMerchantId();

    const uniqueOrderId = createUniqueOrderId();
    const orderPayload = {
      order_id: uniqueOrderId,
      amount: params.amount,
      customer_id: params.user.id,
      customer_email: params.user.email,
      customer_phone: params.user.mobile,
      payment_page_client_id: this.merchantId,
      action: 'paymentPage',
      return_url: 'https://erowayz.in',
      description: 'Complete your payment',
      first_name: params.user.name,
      udf1: params.paymentPurpose,
      udf6: params.referenceId,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/session`,
        orderPayload,
        {
          auth: {
            username: this.apiKey!,
            password: '',
          },
          headers: {
            'x-merchantid': this.merchantId,
            customer_id: params.user.id,
          },
        },
      );
      const responseData = response.data as JuspayOrderResponse;
      return responseData;
    } catch (err) {
      /*------ need to handle the error ------*/
      console.log(err.response.data);
      throw err;
    }
  }

  async handleJuspayResponse({
    order,
    txn_detail,
    card,
  }: {
    order: order;
    txn_detail?: txn_detail;
    card?: card;
  }) {
    const mappedStatus = paymentStatusMap[order.status];

    if (!mappedStatus) {
      console.warn(`Unhandled Juspay status: ${order.status}`);
      return;
    }

    if (mappedStatus === PaymentStatus.FAILED) {
      console.error(
        `Payment failed for orderId=${order.id}, status=${order.status}, reason=${order.status_id || 'N/A'}`,
      );
    }

    // Create/update the Payment record in a transaction
    const payment = await this.prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findUnique({
        where: { orderId: order.order_id },
      });

      if (existingPayment) {
        const currentStatus = existingPayment.status;
        const isUpdateAllowed =
          currentStatus === PaymentStatus.PENDING &&
          (mappedStatus === PaymentStatus.CHARGED ||
            mappedStatus === PaymentStatus.FAILED);

        if (isUpdateAllowed) {
          return tx.payment.update({
            where: { juspayOrderId: order.id },
            data: {
              status:
                mappedStatus === PaymentStatus.CHARGED
                  ? PaymentStatus.PROCESSING
                  : mappedStatus,
              status_id: order.status_id.toString(),
            },
            include: { user: { include: { vendor: true } } },
          });
        } else {
          console.log(
            `Skipping update: Invalid status transition from ${currentStatus} to ${mappedStatus}`,
          );
          return existingPayment;
        }
      }

      // Create new payment
      return tx.payment.create({
        data: {
          juspayOrderId: order.id,
          orderId: order.order_id,
          amount: Number(order.amount),
          purpose: order.udf1,
          referenceId: order.udf6,
          status:
            mappedStatus === PaymentStatus.CHARGED
              ? PaymentStatus.PROCESSING
              : mappedStatus,
          userId: order.customer_id,
          paymentPageExpiry: order.order_expiry,
          paymentLinkWeb: order.payment_links?.web,
          juspayTxnId: order.txn_id,
          gatewayTxnUuid: order.gateway_reference_id,
          gatewayId: order.gateway_id ? parseInt(order.gateway_id) : undefined,
          gateway: txn_detail?.gateway,
          status_id: order.status_id.toString(),
          auth_type: order.auth_type,
          paymentMethod: order.payment_method_type,
          cardLast4: card?.last_four_digits,
          cardType: card?.card_type,
          cardBrand: card?.card_brand,
          cardIssuerCountry: card?.card_issuer_country,
        },
        include: { user: { include: { vendor: true } } },
      });
    });

    // Only enqueue payment for further processing if it’s CHARGED
    if (payment && mappedStatus === PaymentStatus.CHARGED) {
      await this.queueService.processPaymentJob(payment.id); // enqueue job
    }
  }
}
