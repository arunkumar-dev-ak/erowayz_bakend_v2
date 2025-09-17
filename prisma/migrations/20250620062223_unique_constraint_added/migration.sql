/*
  Warnings:

  - A unique constraint covering the columns `[userId,vendorId]` on the table `FavouriteCustomerForVendor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,vendorId]` on the table `FavouriteVendorForCustomer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FavouriteCustomerForVendor_userId_vendorId_idx";

-- DropIndex
DROP INDEX "FavouriteVendorForCustomer_userId_vendorId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteCustomerForVendor_userId_vendorId_key" ON "FavouriteCustomerForVendor"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteVendorForCustomer_userId_vendorId_key" ON "FavouriteVendorForCustomer"("userId", "vendorId");
