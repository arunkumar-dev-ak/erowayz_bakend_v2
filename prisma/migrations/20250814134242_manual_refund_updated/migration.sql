/*
  Warnings:

  - Added the required column `amount` to the `ManualRefund` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ManualRefund" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;
