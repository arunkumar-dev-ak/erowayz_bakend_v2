/*
  Warnings:

  - A unique constraint covering the columns `[feature,vendorSubscriptionId,itemId]` on the table `VendorFeatureUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."VendorFeatureUsage_feature_vendorSubscriptionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "VendorFeatureUsage_feature_vendorSubscriptionId_itemId_key" ON "public"."VendorFeatureUsage"("feature", "vendorSubscriptionId", "itemId");

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
