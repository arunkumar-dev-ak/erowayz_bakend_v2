/*
  Warnings:

  - You are about to drop the column `bankName` on the `BankDetail` table. All the data in the column will be lost.
  - You are about to drop the column `bankPlatformType` on the `BankDetail` table. All the data in the column will be lost.
  - You are about to drop the column `qtyUnit` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `quantityUnit` on the `BannerVendorItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityUnit` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `licenseType` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `quantityUnit` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `ShopInfo` table. All the data in the column will be lost.
  - You are about to drop the column `shopType` on the `ShopInfo` table. All the data in the column will be lost.
  - Made the column `bankNameId` on table `BankDetail` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bankPaymentTypeId` on table `BankDetail` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `productUnitId` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productUnitId` to the `BannerVendorItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `productUnitId` on table `Item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `licenseCategoryId` on table `License` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shopCityId` on table `ShopInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shopCategoryId` on table `ShopInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."BankDetail" DROP COLUMN "bankName",
DROP COLUMN "bankPlatformType",
ALTER COLUMN "bankNameId" SET NOT NULL,
ALTER COLUMN "bankPaymentTypeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Banner" DROP COLUMN "qtyUnit",
ADD COLUMN     "productUnitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."BannerVendorItem" DROP COLUMN "quantityUnit",
ADD COLUMN     "productUnitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Item" DROP COLUMN "quantityUnit",
ALTER COLUMN "productUnitId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."License" DROP COLUMN "licenseType",
ALTER COLUMN "licenseCategoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "quantityUnit";

-- AlterTable
ALTER TABLE "public"."ShopInfo" DROP COLUMN "city",
DROP COLUMN "shopType",
ALTER COLUMN "shopCityId" SET NOT NULL,
ALTER COLUMN "shopCategoryId" SET NOT NULL;

-- DropEnum
DROP TYPE "public"."QuantityUnit";

-- AddForeignKey
ALTER TABLE "public"."Banner" ADD CONSTRAINT "Banner_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "public"."ProductUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BannerVendorItem" ADD CONSTRAINT "BannerVendorItem_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "public"."ProductUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
