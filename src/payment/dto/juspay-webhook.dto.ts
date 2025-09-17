import { PaymentPurpose } from '@prisma/client';

export enum JuspayOrderStatus {
  NEW = 'NEW',
  PENDING_VBV = 'PENDING_VBV',
  CHARGED = 'CHARGED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  JUSPAY_DECLINED = 'JUSPAY_DECLINED',
  AUTHORIZING = 'AUTHORIZING',
  COD_INITIATED = 'COD_INITIATED',
  STARTED = 'STARTED',
  AUTO_REFUNDED = 'AUTO_REFUNDED',
  PARTIAL_CHARGED = 'PARTIAL_CHARGED',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURE_INITIATED = 'CAPTURE_INITIATED',
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  VOIDED = 'VOIDED',
  VOID_INITIATED = 'VOID_INITIATED',
  VOID_FAILED = 'VOID_FAILED',
  NOT_FOUND = 'NOT_FOUND',
}

export enum JuspayEventName {
  ORDER_SUCCEEDED = 'ORDER_SUCCEEDED',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_FAILED = 'ORDER_FAILED',
}

export interface JuspayWebHookType {
  id: string;
  content: {
    order: order;
  };
  event_name: JuspayEventName;
}

export interface JuspayOrderResponse {
  status: string;
  id: string;
  order_id: string;
  payment_links: {
    web: string;
    expiry: string;
  };
  sdk_payload: {
    requestId: string;
    service: string;
    payload: {
      clientId: string;
      customerId: string;
      orderId: string;
      currency: string;
      customerEmail: string;
      customerPhone: string;
      service: string;
      environment: string;
      merchantId: string;
      amount: string;
      clientAuthTokenExpiry: string;
      clientAuthToken: string;
      action: string;
      collectAvsInfo: boolean;
    };
    expiry: string;
  };
  order_expiry: string;
}

/*----- helper interface -----*/
export interface txn_detail {
  txn_id: string;
  gateway_id: string;
  gateway: string;
}

export interface card {
  last_four_digits: string;
  card_type: string;
  card_brand: string;
  card_issuer_country: string;
}

export interface order {
  id: string;
  status: JuspayOrderStatus;
  order_expiry: string;
  bank_error_message?: string;
  gateway_id?: string;
  customer_email: string;
  customer_phone: string;
  status_id: string;
  merchant_id: string;
  amount: string;
  order_id: string;
  txn_id?: string;
  customer_id: string;
  udf1: PaymentPurpose;
  udf6: string;
  auth_type?: string;
  payment_method_type?: string;
  gateway_reference_id?: string;
  payment_links: {
    web: string;
  };
  card?: card;
  txn_detail?: txn_detail;
}
