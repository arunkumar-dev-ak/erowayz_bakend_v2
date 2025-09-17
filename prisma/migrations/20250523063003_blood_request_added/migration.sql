-- CreateEnum
CREATE TYPE "DynamicContext" AS ENUM ('BLOOD_DETAIL', 'BLOOD_REQUEST');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SINGLE_SELECT', 'MULTI_SELECT', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "BloodRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "SubService" ADD COLUMN     "imageRef" TEXT,
ADD COLUMN     "relativeUrl" TEXT;

-- CreateTable
CREATE TABLE "KeywordBanner" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicField" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "pattern" TEXT,
    "errorMessage" TEXT,
    "context" "DynamicContext" NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicSelectOption" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "DynamicSelectOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "BloodRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dynamicFieldData" JSONB,

    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeywordBanner_bannerId_keywordId_key" ON "KeywordBanner"("bannerId", "keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicField_label_context_key" ON "DynamicField"("label", "context");

-- CreateIndex
CREATE INDEX "BloodRequest_userId_donorId_idx" ON "BloodRequest"("userId", "donorId");

-- AddForeignKey
ALTER TABLE "KeywordBanner" ADD CONSTRAINT "KeywordBanner_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordBanner" ADD CONSTRAINT "KeywordBanner_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicSelectOption" ADD CONSTRAINT "DynamicSelectOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "DynamicField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
