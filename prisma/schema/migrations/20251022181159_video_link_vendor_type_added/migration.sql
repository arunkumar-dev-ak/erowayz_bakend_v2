-- AlterTable
ALTER TABLE "public"."VideoLink" ADD COLUMN     "vendorTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."VideoLink" ADD CONSTRAINT "VideoLink_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
