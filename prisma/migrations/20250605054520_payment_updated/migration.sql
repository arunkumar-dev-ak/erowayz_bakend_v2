/*
  Warnings:

  - Made the column `paymentPageExpiry` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentLinkWeb` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "paymentPageExpiry" SET NOT NULL,
ALTER COLUMN "paymentLinkWeb" SET NOT NULL;
