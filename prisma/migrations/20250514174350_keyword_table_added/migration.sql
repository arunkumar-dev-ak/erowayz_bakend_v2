/*
  Warnings:

  - A unique constraint covering the columns `[name,vendorId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "KeyWordType" AS ENUM ('BANNER', 'VENDORT_TYPE');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CASH';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "relativeUrl" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "paymentMethod" "PaymentMethod"[];

-- CreateTable
CREATE TABLE "keyWord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "keyWordType" "KeyWordType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVendorKeyword" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceVendorKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "keyWord_vendorTypeId_name_keyWordType_idx" ON "keyWord"("vendorTypeId", "name", "keyWordType");

-- CreateIndex
CREATE INDEX "keyWord_id_vendorTypeId_idx" ON "keyWord"("id", "vendorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "keyWord_vendorTypeId_name_key" ON "keyWord"("vendorTypeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceVendorKeyword_keywordId_vendorId_key" ON "ServiceVendorKeyword"("keywordId", "vendorId");

-- CreateIndex
CREATE INDEX "Item_vendorId_status_idx" ON "Item"("vendorId", "status");

-- CreateIndex
CREATE INDEX "Item_productstatus_idx" ON "Item"("productstatus");

-- CreateIndex
CREATE INDEX "Item_remainingQty_idx" ON "Item"("remainingQty");

-- CreateIndex
CREATE INDEX "Item_dailyTotalQty_idx" ON "Item"("dailyTotalQty");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_vendorId_key" ON "Item"("name", "vendorId");

-- AddForeignKey
ALTER TABLE "keyWord" ADD CONSTRAINT "keyWord_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVendorKeyword" ADD CONSTRAINT "ServiceVendorKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVendorKeyword" ADD CONSTRAINT "ServiceVendorKeyword_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
