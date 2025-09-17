/*
  Warnings:

  - You are about to drop the column `amount` on the `ManualRefund` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ManualRefund" DROP COLUMN "amount",
ALTER COLUMN "paymentId" DROP NOT NULL;
