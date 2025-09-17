-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CHARGED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'ITEM_ORDER');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "juspayOrderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PaymentType" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "paymentPageExpiry" TIMESTAMP(3),
    "paymentLinkWeb" TEXT,
    "juspayTxnId" TEXT,
    "gatewayTxnUuid" TEXT,
    "gatewayId" INTEGER,
    "gateway" TEXT,
    "status_id" TEXT,
    "auth_type" TEXT,
    "paymentMethod" TEXT,
    "cardLast4" TEXT,
    "cardType" TEXT,
    "cardBrand" TEXT,
    "cardIssuerCountry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "uniqueRequestId" TEXT NOT NULL,
    "initiatedBy" TEXT,
    "refundType" TEXT,
    "refundSource" TEXT,
    "sentToGateway" BOOLEAN,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentId" TEXT NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSubscription" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "planId" TEXT,
    "planName" TEXT NOT NULL,
    "planFeatures" JSONB NOT NULL,
    "planBillingPeriod" "BillingPeriod" NOT NULL,
    "planPrice" INTEGER NOT NULL,
    "planDiscountPrice" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_juspayOrderId_key" ON "Payment"("juspayOrderId");

-- CreateIndex
CREATE INDEX "Payment_type_referenceId_idx" ON "Payment"("type", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_uniqueRequestId_key" ON "Refund"("uniqueRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubscription_paymentId_key" ON "VendorSubscription"("paymentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
