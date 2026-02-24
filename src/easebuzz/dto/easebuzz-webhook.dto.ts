import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum EaseBuzzPaymentStatus {
  success = 'success',
  failure = 'failure',
  userCancelled = 'userCancelled',
}

export const paymentStatusMap: Record<EaseBuzzPaymentStatus, PaymentStatus> = {
  [EaseBuzzPaymentStatus.success]: PaymentStatus.CHARGED,
  [EaseBuzzPaymentStatus.failure]: PaymentStatus.FAILED,
  [EaseBuzzPaymentStatus.userCancelled]: PaymentStatus.FAILED,
};

export class EasebuzzWebhookDto {
  @ApiProperty({ description: 'Merchant key' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Transaction ID' })
  @IsString()
  @IsNotEmpty()
  txnid!: string;

  @ApiProperty({ description: 'Transaction amount' })
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ description: 'Product info' })
  @IsString()
  @IsNotEmpty()
  productinfo!: string;

  @ApiProperty({ description: 'Customer first name' })
  @IsString()
  @IsNotEmpty()
  firstname!: string;

  @ApiProperty({ description: 'Customer email' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Customer phone number' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: 'Payment status (success | failure | etc)' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ description: 'Unmapped status' })
  @IsString()
  @IsOptional()
  unmappedstatus!: string;

  @ApiProperty({ description: 'Easebuzz payment ID' })
  @IsString()
  @IsOptional()
  easepayid!: string;

  @ApiProperty({ description: 'Hash for verification' })
  @IsString()
  @IsNotEmpty()
  hash!: string;

  @ApiProperty({ description: 'Payment mode' })
  @IsString()
  @IsOptional()
  mode!: string;

  @ApiProperty({ description: 'Payment gateway type' })
  @IsString()
  @IsOptional()
  PG_TYPE!: string;

  @ApiProperty({ description: 'Payment source' })
  @IsString()
  @IsOptional()
  payment_source!: string;

  @ApiProperty({ description: 'Bank code' })
  @IsString()
  @IsOptional()
  bankcode!: string;

  @ApiProperty({ description: 'Bank name' })
  @IsString()
  @IsOptional()
  bank_name!: string;

  @ApiProperty({ description: 'Bank reference number' })
  @IsString()
  @IsOptional()
  bank_ref_num!: string;

  @ApiProperty({ description: 'Authorization code' })
  @IsString()
  @IsOptional()
  auth_code!: string;

  @ApiProperty({ description: 'Authorization reference number' })
  @IsString()
  @IsOptional()
  auth_ref_num!: string;

  @ApiProperty({ description: 'Card type' })
  @IsString()
  @IsOptional()
  card_type!: string;

  @ApiProperty({ description: 'Card category' })
  @IsString()
  @IsOptional()
  cardCategory!: string;

  @ApiProperty({ description: 'Masked card number' })
  @IsString()
  @IsOptional()
  cardnum!: string;

  @ApiProperty({ description: 'Issuing bank' })
  @IsString()
  @IsOptional()
  issuing_bank!: string;

  @ApiProperty({ description: 'Name on card' })
  @IsString()
  @IsOptional()
  name_on_card!: string;

  @ApiProperty({ description: 'Service tax' })
  @IsString()
  @IsOptional()
  service_tax!: string;

  @ApiProperty({ description: 'Service charge' })
  @IsString()
  @IsOptional()
  service_charge!: string;

  @ApiProperty({ description: 'Net amount debited' })
  @IsString()
  @IsOptional()
  net_amount_debit!: string;

  @ApiProperty({ description: 'Settlement amount' })
  @IsString()
  @IsOptional()
  settlement_amount!: string;

  @ApiProperty({ description: 'Deduction percentage' })
  @IsString()
  @IsOptional()
  deduction_percentage!: string;

  @ApiProperty({ description: 'Cashback percentage' })
  @IsString()
  @IsOptional()
  cash_back_percentage!: string;

  @ApiProperty({ description: 'Discount amount' })
  @IsString()
  @IsOptional()
  discount_amount!: string;

  @ApiProperty({ description: 'Discount code' })
  @IsString()
  @IsOptional()
  discount_code!: string;

  @ApiProperty({ description: 'Success URL' })
  @IsString()
  @IsOptional()
  surl!: string;

  @ApiProperty({ description: 'Failure URL' })
  @IsString()
  @IsOptional()
  furl!: string;

  @ApiProperty({ description: 'User defined field 1' })
  @IsString()
  @IsOptional()
  udf1!: string;

  @ApiProperty({ description: 'User defined field 2' })
  @IsString()
  @IsOptional()
  udf2!: string;

  @ApiProperty({ description: 'User defined field 3' })
  @IsString()
  @IsOptional()
  udf3!: string;

  @ApiProperty({ description: 'User defined field 4' })
  @IsString()
  @IsOptional()
  udf4!: string;

  @ApiProperty({ description: 'User defined field 5' })
  @IsString()
  @IsOptional()
  udf5!: string;

  @ApiProperty({ description: 'User defined field 6' })
  @IsString()
  @IsOptional()
  udf6!: string;

  @ApiProperty({ description: 'User defined field 7' })
  @IsString()
  @IsOptional()
  udf7!: string;

  @ApiProperty({ description: 'User defined field 8' })
  @IsString()
  @IsOptional()
  udf8!: string;

  @ApiProperty({ description: 'User defined field 9' })
  @IsString()
  @IsOptional()
  udf9!: string;

  @ApiProperty({ description: 'User defined field 10' })
  @IsString()
  @IsOptional()
  udf10!: string;

  @ApiProperty({ description: 'Transaction added time' })
  @IsString()
  @IsOptional()
  addedon!: string;

  @ApiProperty({ description: 'Error code if any' })
  @IsString()
  @IsOptional()
  error!: string;

  @ApiProperty({ description: 'Error message if any' })
  @IsString()
  @IsOptional()
  error_Message!: string;

  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsOptional()
  cancellation_reason!: string;

  @ApiProperty({ description: 'Payment category' })
  @IsString()
  @IsOptional()
  payment_category!: string;

  @ApiProperty({ description: 'UPI virtual address' })
  @IsString()
  @IsOptional()
  upi_va!: string;
}
