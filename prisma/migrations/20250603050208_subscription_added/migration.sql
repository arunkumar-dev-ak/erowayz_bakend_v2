/*
  Warnings:

  - You are about to drop the `BannerItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BannerProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CURRENT');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'COINS';

-- DropForeignKey
ALTER TABLE "BannerItems" DROP CONSTRAINT "BannerItems_bannerId_fkey";

-- DropForeignKey
ALTER TABLE "BannerItems" DROP CONSTRAINT "BannerItems_itemId_fkey";

-- DropForeignKey
ALTER TABLE "BannerProduct" DROP CONSTRAINT "BannerProduct_vendorId_fkey";

-- DropTable
DROP TABLE "BannerItems";

-- DropTable
DROP TABLE "BannerProduct";

-- CreateTable
CREATE TABLE "BannerVendorItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "vendorId" TEXT NOT NULL,
    "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'GENERAL',
    "productstatus" "ProductStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerVendorItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerVendorItemsImage" (
    "id" TEXT NOT NULL,
    "bannerVendorItemId" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerVendorItemsImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingPeriod" "BillingPeriod" NOT NULL,
    "discountPrice" INTEGER,
    "vendorTypeId" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "gradientStart" TEXT,
    "gradientEnd" TEXT,
    "status" "Status" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetail" (
    "id" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "upiId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannerVendorItem_vendorId_name_key" ON "BannerVendorItem"("vendorId", "name");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_vendorTypeId_idx" ON "SubscriptionPlan"("vendorTypeId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_billingPeriod_idx" ON "SubscriptionPlan"("billingPeriod");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_status_idx" ON "SubscriptionPlan"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_name_idx" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_vendorTypeId_key" ON "SubscriptionPlan"("name", "vendorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetail_vendorId_key" ON "BankDetail"("vendorId");

-- CreateIndex
CREATE INDEX "BankDetail_upiId_idx" ON "BankDetail"("upiId");

-- AddForeignKey
ALTER TABLE "BannerVendorItem" ADD CONSTRAINT "BannerVendorItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerVendorItemsImage" ADD CONSTRAINT "BannerVendorItemsImage_bannerVendorItemId_fkey" FOREIGN KEY ("bannerVendorItemId") REFERENCES "BannerVendorItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetail" ADD CONSTRAINT "BankDetail_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
