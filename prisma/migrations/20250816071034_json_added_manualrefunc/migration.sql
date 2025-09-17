/*
  Warnings:

  - Added the required column `userId` to the `ManualRefund` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ManualRefund" ADD COLUMN     "metaData" JSONB,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ManualRefund" ADD CONSTRAINT "ManualRefund_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
