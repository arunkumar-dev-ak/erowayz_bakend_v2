/*
  Warnings:

  - You are about to drop the column `image` on the `Disclaimer` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `Disclaimer` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `PrivacyPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `TermsAndCondition` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vendorTypeId]` on the table `PrivacyPolicy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vendorTypeId]` on the table `TermsAndCondition` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `disclaimerHtml` to the `Disclaimer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disclaimerHtmlTa` to the `Disclaimer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disclaimerType` to the `Disclaimer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `Poster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privacyPolicyHtml` to the `PrivacyPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privacyPolicyHtmlTa` to the `PrivacyPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsAndConditionHtml` to the `TermsAndCondition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsAndConditionHtmlTa` to the `TermsAndCondition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DisclaimerType" AS ENUM ('PRODUCT_ORDER', 'SERVICE_BOOK', 'BANNER_BOOK');

-- AlterTable
ALTER TABLE "public"."Disclaimer" DROP COLUMN "image",
DROP COLUMN "userType",
ADD COLUMN     "disclaimerHtml" TEXT NOT NULL,
ADD COLUMN     "disclaimerHtmlTa" TEXT NOT NULL,
ADD COLUMN     "disclaimerType" "public"."DisclaimerType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Poster" ADD COLUMN     "userType" "public"."UserType" NOT NULL,
ADD COLUMN     "vendorTypeId" TEXT;

-- AlterTable
ALTER TABLE "public"."PrivacyPolicy" DROP COLUMN "image",
ADD COLUMN     "privacyPolicyHtml" TEXT NOT NULL,
ADD COLUMN     "privacyPolicyHtmlTa" TEXT NOT NULL,
ADD COLUMN     "vendorTypeId" TEXT;

-- AlterTable
ALTER TABLE "public"."TermsAndCondition" DROP COLUMN "image",
ADD COLUMN     "termsAndConditionHtml" TEXT NOT NULL,
ADD COLUMN     "termsAndConditionHtmlTa" TEXT NOT NULL,
ADD COLUMN     "vendorTypeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyPolicy_vendorTypeId_key" ON "public"."PrivacyPolicy"("vendorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "TermsAndCondition_vendorTypeId_key" ON "public"."TermsAndCondition"("vendorTypeId");

-- AddForeignKey
ALTER TABLE "public"."TermsAndCondition" ADD CONSTRAINT "TermsAndCondition_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivacyPolicy" ADD CONSTRAINT "PrivacyPolicy_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Poster" ADD CONSTRAINT "Poster_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
