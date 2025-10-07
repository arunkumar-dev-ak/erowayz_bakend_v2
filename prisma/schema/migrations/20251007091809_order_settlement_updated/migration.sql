/*
  Warnings:

  - You are about to drop the column `proofImage` on the `OrderSettlement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."OrderSettlement" DROP COLUMN "proofImage",
ALTER COLUMN "status" SET DEFAULT 'PAID';

-- CreateTable
CREATE TABLE "public"."OrderSettlementFile" (
    "id" TEXT NOT NULL,
    "proofImage" TEXT NOT NULL,
    "orderSettlementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderSettlementFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."OrderSettlementFile" ADD CONSTRAINT "OrderSettlementFile_orderSettlementId_fkey" FOREIGN KEY ("orderSettlementId") REFERENCES "public"."OrderSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
