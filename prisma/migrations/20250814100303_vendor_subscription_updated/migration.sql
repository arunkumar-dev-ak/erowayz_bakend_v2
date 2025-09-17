/*
  Warnings:

  - Made the column `endDate` on table `VendorSubscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VendorSubscription" ALTER COLUMN "endDate" SET NOT NULL;
