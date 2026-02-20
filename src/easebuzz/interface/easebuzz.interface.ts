export interface EasebuzzInitiateResponseInterface {
  status: number;
  data: string;
  error_desc?: string;
}

export interface EasebuzzTransactionInterface {
  txnid: string;
  firstname: string;
  email: string;
  phone: string;
  key: string;
  mode: string;
  unmappedstatus: string;
  cardCategory: string;
  addedon: string;
  payment_source: string;
  PG_TYPE: string;
  bank_ref_num: string;
  bankcode: string;
  error: string;
  error_Message: string;
  name_on_card: string;
  upi_va: string;
  cardnum: string;
  issuing_bank: string;
  easepayid: string;
  amount: string;
  net_amount_debit: string;
  cash_back_percentage: string;
  deduction_percentage: string;
  merchant_logo: string;
  surl: string;
  furl: string;
  productinfo: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  udf6: string;
  udf7: string;
  udf8: string;
  udf9: string;
  udf10: string;
  card_type: string;
  hash: string;
  status: string;
  bank_name: string;
  auth_code: string;
  auth_ref_num: string;
  response_code: string;
  error_code: string;
}

export interface EaseBuzzTransactionRetrievalInterface {
  status: boolean;
  msg: EasebuzzTransactionInterface[];
}
