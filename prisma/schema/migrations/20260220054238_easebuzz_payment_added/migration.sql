/*
  Warnings:

  - You are about to drop the column `auth_type` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cardBrand` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cardIssuerCountry` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gateway` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gatewayId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gatewayTxnUuid` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `juspayOrderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `juspayTxnId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentLinkWeb` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[txnid]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessKey]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[easepayid]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessKey` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `txnid` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Payment_juspayOrderId_key";

-- DropIndex
DROP INDEX "public"."Payment_orderId_key";

-- DropIndex
DROP INDEX "public"."Payment_paymentPageExpiry_idx";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "auth_type",
DROP COLUMN "cardBrand",
DROP COLUMN "cardIssuerCountry",
DROP COLUMN "gateway",
DROP COLUMN "gatewayId",
DROP COLUMN "gatewayTxnUuid",
DROP COLUMN "juspayOrderId",
DROP COLUMN "juspayTxnId",
DROP COLUMN "orderId",
DROP COLUMN "paymentLinkWeb",
DROP COLUMN "paymentMethod",
DROP COLUMN "status_id",
ADD COLUMN     "accessKey" TEXT NOT NULL,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "bankRefNum" TEXT,
ADD COLUMN     "cashbackPercentage" DOUBLE PRECISION,
ADD COLUMN     "deductionPercentage" DOUBLE PRECISION,
ADD COLUMN     "easepayid" TEXT,
ADD COLUMN     "issuingBank" TEXT,
ADD COLUMN     "mode" TEXT,
ADD COLUMN     "netAmountDebit" DOUBLE PRECISION,
ADD COLUMN     "paymentSource" TEXT,
ADD COLUMN     "productInfo" TEXT,
ADD COLUMN     "responseHash" TEXT,
ADD COLUMN     "statusMessage" TEXT,
ADD COLUMN     "txnid" TEXT NOT NULL,
ADD COLUMN     "unmappedstatus" TEXT,
ADD COLUMN     "upiVa" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_txnid_key" ON "public"."Payment"("txnid");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_accessKey_key" ON "public"."Payment"("accessKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_easepayid_key" ON "public"."Payment"("easepayid");
