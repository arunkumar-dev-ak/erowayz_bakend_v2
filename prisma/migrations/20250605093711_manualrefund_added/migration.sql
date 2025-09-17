-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "ManualRefund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "attachment" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualRefund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManualRefund_paymentId_idx" ON "ManualRefund"("paymentId");

-- AddForeignKey
ALTER TABLE "ManualRefund" ADD CONSTRAINT "ManualRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
