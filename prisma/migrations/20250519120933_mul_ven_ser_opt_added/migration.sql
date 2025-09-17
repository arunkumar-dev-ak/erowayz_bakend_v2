/*
  Warnings:

  - You are about to drop the column `vendorServiceOptionId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `vendorServiceOptionId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_vendorServiceOptionId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_vendorServiceOptionId_fkey";

-- DropIndex
DROP INDEX "OrderItem_vendorServiceOptionId_idx";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "vendorServiceOptionId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "vendorServiceOptionId";

-- CreateTable
CREATE TABLE "CartItemVendorServiceOption" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "vendorServiceOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItemVendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemVendorServiceOption" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "vendorServiceOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItemVendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartItemVendorServiceOption_cartItemId_vendorServiceOptionI_key" ON "CartItemVendorServiceOption"("cartItemId", "vendorServiceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemVendorServiceOption_cartItemId_vendorServiceOption_key" ON "OrderItemVendorServiceOption"("cartItemId", "vendorServiceOptionId");

-- AddForeignKey
ALTER TABLE "CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "VendorServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVendorServiceOption" ADD CONSTRAINT "OrderItemVendorServiceOption_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "VendorServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVendorServiceOption" ADD CONSTRAINT "OrderItemVendorServiceOption_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
