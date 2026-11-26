-- CreateEnum
CREATE TYPE "public"."CustomerReportStatus" AS ENUM ('PENDING', 'VIEWED', 'ACCEPTED', 'DECLINED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."BloodDocumentType" AS ENUM ('PATIENT_CASE_SHEET', 'CAMP_LETTERHEAD');

-- CreateEnum
CREATE TYPE "public"."BloodVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('ACTIVE', 'PENDING_DELETION', 'SUSPENDED', 'DELETED');

-- AlterEnum
ALTER TYPE "public"."LicenseType" ADD VALUE 'PAN';

-- AlterTable
ALTER TABLE "public"."BloodRequest" ADD COLUMN     "documentRelativeUrl" TEXT,
ADD COLUMN     "documentType" "public"."BloodDocumentType",
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "verificationStatus" "public"."BloodVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."License" ADD COLUMN     "isKycConsentAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kycConsentAcceptedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "accountStatus" "public"."AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "anonymizedAt" TIMESTAMP(3),
ADD COLUMN     "deletionReason" TEXT,
ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledDeletionAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."BusinessLoadTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minOrders" INTEGER NOT NULL DEFAULT 0,
    "maxOrders" INTEGER,
    "color" TEXT NOT NULL DEFAULT '#22C55E',
    "estimatedWaitTimeText" TEXT DEFAULT '10-15 mins',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessLoadTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "bookingId" TEXT,
    "reason" TEXT NOT NULL,
    "status" "public"."CustomerReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FoodPreference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FoodPreferenceSubCategory" (
    "id" TEXT NOT NULL,
    "foodPreferenceId" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodPreferenceSubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderFoodPreference" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "foodPreferenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderFoodPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "identifier" TEXT NOT NULL DEFAULT 'GENERAL',
    "payload" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RetiredReferralCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetiredReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrustSetting" (
    "id" TEXT NOT NULL,
    "orderThreshold" INTEGER NOT NULL DEFAULT 15,
    "description" TEXT DEFAULT 'Target completed orders threshold across Street Food, Common Shops, and Vehicle Services',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "orderId" TEXT,
    "bookingId" TEXT,
    "ratings" JSONB,
    "overallRating" DOUBLE PRECISION,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessLoadTier_isActive_orderIndex_idx" ON "public"."BusinessLoadTier"("isActive", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReport_orderId_key" ON "public"."CustomerReport"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReport_bookingId_key" ON "public"."CustomerReport"("bookingId");

-- CreateIndex
CREATE INDEX "CustomerReport_userId_status_idx" ON "public"."CustomerReport"("userId", "status");

-- CreateIndex
CREATE INDEX "CustomerReport_status_createdAt_idx" ON "public"."CustomerReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerReport_orderId_idx" ON "public"."CustomerReport"("orderId");

-- CreateIndex
CREATE INDEX "CustomerReport_bookingId_idx" ON "public"."CustomerReport"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodPreference_name_key" ON "public"."FoodPreference"("name");

-- CreateIndex
CREATE INDEX "FoodPreference_isActive_idx" ON "public"."FoodPreference"("isActive");

-- CreateIndex
CREATE INDEX "FoodPreferenceSubCategory_foodPreferenceId_idx" ON "public"."FoodPreferenceSubCategory"("foodPreferenceId");

-- CreateIndex
CREATE INDEX "FoodPreferenceSubCategory_subCategoryId_idx" ON "public"."FoodPreferenceSubCategory"("subCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodPreferenceSubCategory_foodPreferenceId_subCategoryId_key" ON "public"."FoodPreferenceSubCategory"("foodPreferenceId", "subCategoryId");

-- CreateIndex
CREATE INDEX "OrderFoodPreference_orderId_idx" ON "public"."OrderFoodPreference"("orderId");

-- CreateIndex
CREATE INDEX "OrderFoodPreference_foodPreferenceId_idx" ON "public"."OrderFoodPreference"("foodPreferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderFoodPreference_orderId_foodPreferenceId_key" ON "public"."OrderFoodPreference"("orderId", "foodPreferenceId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "public"."Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_identifier_idx" ON "public"."Notification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "RetiredReferralCode_code_key" ON "public"."RetiredReferralCode"("code");

-- CreateIndex
CREATE INDEX "RetiredReferralCode_userId_idx" ON "public"."RetiredReferralCode"("userId");

-- CreateIndex
CREATE INDEX "VendorRating_vendorId_idx" ON "public"."VendorRating"("vendorId");

-- CreateIndex
CREATE INDEX "VendorRating_userId_idx" ON "public"."VendorRating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorRating_userId_vendorId_key" ON "public"."VendorRating"("userId", "vendorId");

-- CreateIndex
CREATE INDEX "BloodRequest_verificationStatus_idx" ON "public"."BloodRequest"("verificationStatus");

-- AddForeignKey
ALTER TABLE "public"."CustomerReport" ADD CONSTRAINT "CustomerReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerReport" ADD CONSTRAINT "CustomerReport_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerReport" ADD CONSTRAINT "CustomerReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoodPreferenceSubCategory" ADD CONSTRAINT "FoodPreferenceSubCategory_foodPreferenceId_fkey" FOREIGN KEY ("foodPreferenceId") REFERENCES "public"."FoodPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoodPreferenceSubCategory" ADD CONSTRAINT "FoodPreferenceSubCategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderFoodPreference" ADD CONSTRAINT "OrderFoodPreference_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderFoodPreference" ADD CONSTRAINT "OrderFoodPreference_foodPreferenceId_fkey" FOREIGN KEY ("foodPreferenceId") REFERENCES "public"."FoodPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorRating" ADD CONSTRAINT "VendorRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorRating" ADD CONSTRAINT "VendorRating_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
