/*
  Warnings:

  - You are about to drop the column `description` on the `VendorSubService` table. All the data in the column will be lost.
  - You are about to drop the column `serviceOptionId` on the `VendorSubService` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `VendorSubService` table. All the data in the column will be lost.
  - You are about to drop the column `vendorId` on the `VendorSubService` table. All the data in the column will be lost.
  - You are about to drop the `VendorSubServiceImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,serviceId]` on the table `VendorSubService` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceId` to the `VendorSubService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VendorSubService" DROP CONSTRAINT "VendorSubService_serviceOptionId_fkey";

-- DropForeignKey
ALTER TABLE "VendorSubService" DROP CONSTRAINT "VendorSubService_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "VendorSubServiceImage" DROP CONSTRAINT "VendorSubServiceImage_vendorSubServiceId_fkey";

-- DropIndex
DROP INDEX "VendorSubService_name_vendorId_serviceOptionId_key";

-- DropIndex
DROP INDEX "VendorSubService_vendorId_idx";

-- AlterTable
ALTER TABLE "VendorSubService" DROP COLUMN "description",
DROP COLUMN "serviceOptionId",
DROP COLUMN "status",
DROP COLUMN "vendorId",
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- DropTable
DROP TABLE "VendorSubServiceImage";

-- CreateTable
CREATE TABLE "FavouriteCustomerForVendor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteCustomerForVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteVendorForCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteVendorForCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceOptionId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceImage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavouriteCustomerForVendor_userId_vendorId_idx" ON "FavouriteCustomerForVendor"("userId", "vendorId");

-- CreateIndex
CREATE INDEX "FavouriteVendorForCustomer_userId_vendorId_idx" ON "FavouriteVendorForCustomer"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_vendorId_serviceOptionId_key" ON "Service"("name", "vendorId", "serviceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceImage_relativeUrl_key" ON "ServiceImage"("relativeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceImage_absoluteUrl_key" ON "ServiceImage"("absoluteUrl");

-- CreateIndex
CREATE INDEX "BannerBooking_vendorId_idx" ON "BannerBooking"("vendorId");

-- CreateIndex
CREATE INDEX "shopinfo_location_idx" ON "ShopInfo" USING GIST ("location");

-- CreateIndex
CREATE INDEX "VendorSubService_serviceId_idx" ON "VendorSubService"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubService_name_serviceId_key" ON "VendorSubService"("name", "serviceId");

-- AddForeignKey
ALTER TABLE "FavouriteCustomerForVendor" ADD CONSTRAINT "FavouriteCustomerForVendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteCustomerForVendor" ADD CONSTRAINT "FavouriteCustomerForVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteVendorForCustomer" ADD CONSTRAINT "FavouriteVendorForCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteVendorForCustomer" ADD CONSTRAINT "FavouriteVendorForCustomer_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubService" ADD CONSTRAINT "VendorSubService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceImage" ADD CONSTRAINT "ServiceImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
