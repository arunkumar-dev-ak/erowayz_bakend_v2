/*
  Warnings:

  - You are about to drop the column `orderPaymentStatus` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `purpose` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderPaymentType" AS ENUM ('COINS', 'JUSPAY', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('SUBSCRIPTION_PURCHASE', 'PRODUCT_PURCHASE', 'COIN_PURCHASE');

-- DropIndex
DROP INDEX "Order_orderStatus_expiryAt_id_idx";

-- DropIndex
DROP INDEX "Order_orderStatus_idx";

-- DropIndex
DROP INDEX "Payment_type_referenceId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderPaymentStatus",
DROP COLUMN "paymentMethod",
ADD COLUMN     "preferredPaymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "type",
ADD COLUMN     "purpose" "PaymentPurpose" NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockedBalance" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE INTEGER;

-- DropEnum
DROP TYPE "PaymentType";

-- CreateTable
CREATE TABLE "OrderPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "walletTransactionId" TEXT,
    "type" "OrderPaymentType" NOT NULL,
    "paidedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "OrderPaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentErrorLog" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "vendorUserId" TEXT NOT NULL,
    "purpose" "PaymentPurpose",
    "customerUserId" TEXT,
    "errorType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_orderId_key" ON "OrderPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_paymentId_key" ON "OrderPayment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_walletTransactionId_key" ON "OrderPayment"("walletTransactionId");

-- CreateIndex
CREATE INDEX "OrderPayment_orderId_idx" ON "OrderPayment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_purpose_referenceId_idx" ON "Payment"("purpose", "referenceId");

-- CreateIndex
CREATE INDEX "Payment_purpose_userId_status_idx" ON "Payment"("purpose", "userId", "status");

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "WalletTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
