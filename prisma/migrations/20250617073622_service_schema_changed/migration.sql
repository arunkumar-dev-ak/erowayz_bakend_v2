/*
  Warnings:

  - You are about to drop the column `isLaunched` on the `VendorServiceOption` table. All the data in the column will be lost.
  - You are about to drop the `SubService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VendorSubServicePricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceBooking" DROP CONSTRAINT "ServiceBooking_vendorSubServiceId_fkey";

-- DropForeignKey
ALTER TABLE "SubService" DROP CONSTRAINT "SubService_serviceOptionId_fkey";

-- DropForeignKey
ALTER TABLE "VendorSubServicePricing" DROP CONSTRAINT "VendorSubServicePricing_subServiceId_fkey";

-- DropForeignKey
ALTER TABLE "VendorSubServicePricing" DROP CONSTRAINT "VendorSubServicePricing_vendorServiceOptId_fkey";

-- AlterTable
ALTER TABLE "VendorServiceOption" DROP COLUMN "isLaunched";

-- DropTable
DROP TABLE "SubService";

-- DropTable
DROP TABLE "VendorSubServicePricing";

-- CreateTable
CREATE TABLE "VendorSubService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "serviceOptionId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSubServiceImage" (
    "id" TEXT NOT NULL,
    "vendorSubServiceId" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubServiceImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorSubService_vendorId_idx" ON "VendorSubService"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubService_name_vendorId_serviceOptionId_key" ON "VendorSubService"("name", "vendorId", "serviceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubServiceImage_relativeUrl_key" ON "VendorSubServiceImage"("relativeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubServiceImage_absoluteUrl_key" ON "VendorSubServiceImage"("absoluteUrl");

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_vendorSubServiceId_fkey" FOREIGN KEY ("vendorSubServiceId") REFERENCES "VendorSubService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubService" ADD CONSTRAINT "VendorSubService_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubService" ADD CONSTRAINT "VendorSubService_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubServiceImage" ADD CONSTRAINT "VendorSubServiceImage_vendorSubServiceId_fkey" FOREIGN KEY ("vendorSubServiceId") REFERENCES "VendorSubService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
