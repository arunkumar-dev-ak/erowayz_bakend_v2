-- DropForeignKey
ALTER TABLE "public"."VendorSubscription" DROP CONSTRAINT "VendorSubscription_paymentId_fkey";

-- AlterTable
ALTER TABLE "public"."VendorSubscription" ALTER COLUMN "paymentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."VendorSubscription" ADD CONSTRAINT "VendorSubscription_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
