/*
  Warnings:

  - Added the required column `updatedAt` to the `PaymentErrorLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ErrorLogStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."UserReportStatusType" AS ENUM ('PENDING', 'RESOLVED');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "platformFee" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."PaymentErrorLog" ADD COLUMN     "status" "public"."ErrorLogStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."CoinImage" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformFees" (
    "id" TEXT NOT NULL,
    "startAmount" INTEGER NOT NULL,
    "endAmount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentErrorLogFile" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "paymentErrorLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentErrorLogFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserReport" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "bookingId" TEXT,
    "userId" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "status" "public"."UserReportStatusType" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformFees_startAmount_idx" ON "public"."PlatformFees"("startAmount");

-- CreateIndex
CREATE INDEX "PlatformFees_endAmount_idx" ON "public"."PlatformFees"("endAmount");

-- CreateIndex
CREATE INDEX "UserReport_userId_idx" ON "public"."UserReport"("userId");

-- AddForeignKey
ALTER TABLE "public"."PaymentErrorLog" ADD CONSTRAINT "PaymentErrorLog_vendorUserId_fkey" FOREIGN KEY ("vendorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentErrorLog" ADD CONSTRAINT "PaymentErrorLog_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentErrorLogFile" ADD CONSTRAINT "PaymentErrorLogFile_paymentErrorLogId_fkey" FOREIGN KEY ("paymentErrorLogId") REFERENCES "public"."PaymentErrorLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
