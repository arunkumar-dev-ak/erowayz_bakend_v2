/*
  Warnings:

  - Added the required column `quantity` to the `BannerVendorItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BannerVendorItem" ADD COLUMN     "quantity" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_paymentPageExpiry_idx" ON "Payment"("paymentPageExpiry");
