/*
  Warnings:

  - A unique constraint covering the columns `[name,vendorTypeId,billingPeriod]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SubscriptionPlan_name_vendorTypeId_key";

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_vendorTypeId_billingPeriod_key" ON "SubscriptionPlan"("name", "vendorTypeId", "billingPeriod");
