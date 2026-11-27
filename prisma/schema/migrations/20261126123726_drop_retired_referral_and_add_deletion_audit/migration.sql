/*
  Warnings:

  - You are about to drop the `RetiredReferralCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."RetiredReferralCode";

-- CreateTable
CREATE TABLE "public"."AccountDeletionAudit" (
    "id" TEXT NOT NULL,
    "originalUserId" TEXT NOT NULL,
    "vendorId" TEXT,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "role" "public"."Role" NOT NULL,
    "deletionType" TEXT NOT NULL,
    "deletedByAdminId" TEXT,
    "walletInfo" JSONB,
    "refundClaimed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDeletionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountDeletionAudit_mobile_idx" ON "public"."AccountDeletionAudit"("mobile");

-- CreateIndex
CREATE INDEX "AccountDeletionAudit_email_idx" ON "public"."AccountDeletionAudit"("email");

-- CreateIndex
CREATE INDEX "AccountDeletionAudit_originalUserId_idx" ON "public"."AccountDeletionAudit"("originalUserId");
