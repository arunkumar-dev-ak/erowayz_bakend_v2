-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'SUB_ADMIN';

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "tamilName" TEXT;

-- AlterTable
ALTER TABLE "public"."LicenseCategory" ADD COLUMN     "tamilName" TEXT;

-- AlterTable
ALTER TABLE "public"."ProductUnit" ADD COLUMN     "tamilName" TEXT;

-- AlterTable
ALTER TABLE "public"."ShopCategory" ADD COLUMN     "tamilName" TEXT;

-- AlterTable
ALTER TABLE "public"."SubCategory" ADD COLUMN     "tamilName" TEXT;

-- AlterTable
ALTER TABLE "public"."VendorSubscription" ADD COLUMN     "referredVendorId" TEXT;

-- AlterTable
ALTER TABLE "public"."VideoLink" ADD COLUMN     "tamilHeading" TEXT;

-- CreateTable
CREATE TABLE "public"."VendorFeatureUsage" (
    "id" TEXT NOT NULL,
    "itemId" TEXT,
    "shopId" TEXT,
    "feature" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "vendorSubscriptionId" TEXT NOT NULL,

    CONSTRAINT "VendorFeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorFeatureUsage_itemId_idx" ON "public"."VendorFeatureUsage"("itemId");

-- CreateIndex
CREATE INDEX "VendorFeatureUsage_shopId_idx" ON "public"."VendorFeatureUsage"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorFeatureUsage_feature_vendorSubscriptionId_key" ON "public"."VendorFeatureUsage"("feature", "vendorSubscriptionId");

-- AddForeignKey
ALTER TABLE "public"."VendorSubscription" ADD CONSTRAINT "VendorSubscription_referredVendorId_fkey" FOREIGN KEY ("referredVendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorFeatureUsage" ADD CONSTRAINT "VendorFeatureUsage_vendorSubscriptionId_fkey" FOREIGN KEY ("vendorSubscriptionId") REFERENCES "public"."VendorSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorFeatureUsage" ADD CONSTRAINT "VendorFeatureUsage_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."ShopInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorFeatureUsage" ADD CONSTRAINT "VendorFeatureUsage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
